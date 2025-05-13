const path = require('path');
const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');

class CartController {

    // GET /cart
    async showCart(req, res, next) {
        try {
            // 1. Bảo đảm đã login
            if (!req.session.user) {
                return res.redirect('/login');
            }
            const userId = req.session.user._id;

            console.log('Fetching cart for user:', userId);

            // 2. Lấy cart, populate chỉ lấy đúng các trường cần thiết
            const cart = await Cart
                .findOne({ userId })
                .populate('items.productId', 'title sellPrice thumbnail')
                .lean();

            console.log('Cart found:', cart ? 'Yes' : 'No');

            if (!cart || !cart.items || cart.items.length === 0) {
                console.log('Cart is empty');
                return res.render('client/pages/shop-cart', {
                    layout: 'main',
                    pageTitle: "Cart",
                    cartItems: [],
                    subtotal: 0,
                    cartCount: 0,
                    user: req.session.user || null,
                    currentPage: "cart"
                });
            }

            console.log('Cart items count:', cart.items.length);

            // 3. Build lại mảng cartItems 
            const cartItems = cart.items.map(item => {
                console.log('Processing item:', item);
                return {
                    _id: item._id,                            // để xóa theo item._id
                    title: item.productId?.title || '—',
                    sellPrice: item.productId?.sellPrice || 0,
                    thumbnail: item.productId?.thumbnail || '',      // dùng trường thumbnail từ Product
                    quantity: item.quantity,
                    total: item.quantity * (item.productId?.sellPrice || 0)
                };
            });

            // 4. Tính subtotal
            const subtotal = cartItems.reduce((sum, i) => sum + i.total, 0);

            // 5. Tính tổng số lượng sản phẩm trong giỏ hàng
            const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

            console.log('Rendering cart with items:', cartItems.length);

            const user = req.session.user || null;
            // 6. Render view với dữ liệu
            res.render('client/pages/shop-cart', {
                layout: 'main',
                pageTitle: "Cart",
                cartItems,
                subtotal,
                cartCount,
                user,
                currentPage: "cart"
            });
        } catch (error) {
            console.error('Error in showCart:', error);
            res.status(500).send('Đã xảy ra lỗi khi hiển thị giỏ hàng');
        }
    }

    // POST /cart/add/:productId
    async addToCart(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            const userId = req.session.user._id;
            const prodId = req.params.productId;
            const qty = parseInt(req.body.qty) || 1;

            console.log('Adding to cart:', { userId, prodId, qty });

            // 1. Kiểm tra product tồn tại
            const product = await Product.findById(prodId).lean();
            if (!product) {
                console.log('Product not found');
                return res.status(404).send('Product not found');
            }

            console.log('Product found:', product.title);

            // Tính tồn kho
            const stockCount = await Product.countDocuments({
                import: product.import,
                status: { $in: ['IN_STOCK', 'ON_SALE'] }
            });

            // Kiểm tra số lượng tồn kho
            if (!stockCount || stockCount <= 0) {
                console.log('Product out of stock');
                return res.status(400).json({
                    success: false,
                    message: 'Sản phẩm đã hết hàng'
                });
            }

            // Kiểm tra nếu số lượng yêu cầu vượt quá số lượng tồn kho
            if (qty > stockCount) {
                console.log(`Requested quantity (${qty}) exceeds available stock (${stockCount})`);
                return res.status(400).json({
                    success: false,
                    message: `Chỉ còn ${stockCount} sản phẩm trong kho`
                });
            }

            // 2. Lấy hoặc khởi tạo cart
            let cart = await Cart.findOne({ userId });
            if (!cart) {
                console.log('Creating new cart');
                cart = new Cart({
                    userId,
                    items: []
                });
            } else {
                console.log('Found existing cart:', cart._id);
            }

            // Đảm bảo items là một mảng
            if (!cart.items) {
                cart.items = [];
            }

            // 3. Nếu đã có item thì tăng quantity, ngược lại push mới
            const idx = cart.items.findIndex(i => i.productId && i.productId.toString() === prodId);
            if (idx > -1) {
                console.log('Updating existing item in cart');
                cart.items[idx].quantity += qty;
            } else {
                console.log('Adding new item to cart');
                cart.items.push({
                    productId: product._id,
                    quantity: qty
                });
            }

            console.log('Saving cart with items:', cart.items);
            await cart.save();
            console.log('Cart saved successfully');

            // Nếu request là AJAX, trả về JSON response
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.json({ success: true, message: 'Sản phẩm đã được thêm vào giỏ hàng' });
            }

            // Nếu không phải AJAX, redirect như cũ
            res.redirect('/cart');
        } catch (error) {
            console.error('Error in addToCart:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng',
                error: error.message
            });
        }
    }

    // GET /cart/remove/:itemId
    async removeItem(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            const userId = req.session.user._id;
            const { itemId } = req.params;

            console.log('Removing item from cart:', { userId, itemId });

            const cart = await Cart.findOne({ userId });
            if (cart) {
                cart.items = cart.items.filter(i => !i._id.equals(itemId));
                await cart.save();
                console.log('Item removed successfully');
            } else {
                console.log('Cart not found');
            }
            res.redirect('/cart');
        } catch (error) {
            console.error('Error in removeItem:', error);
            res.status(500).send('Đã xảy ra lỗi khi xóa sản phẩm khỏi giỏ hàng');
        }
    }

    // GET /cart/count
    async getCartCount(req, res) {
        try {
            if (!req.session.user) {
                return res.json({ count: 0 });
            }

            const userId = req.session.user._id;
            const cart = await Cart.findOne({ userId }).lean();

            // Tính tổng số lượng sản phẩm trong giỏ hàng
            const count = cart && cart.items ?
                cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

            console.log('Cart count for user', userId, ':', count);
            res.json({ count });
        } catch (error) {
            console.error('Error in getCartCount:', error);
            res.json({ count: 0, error: 'Đã xảy ra lỗi khi lấy số lượng sản phẩm trong giỏ hàng' });
        }
    }

    // POST /cart/update/:itemId
    async updateItemQuantity(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập' });
            }

            const userId = req.session.user._id;
            const { itemId } = req.params;
            const { quantity } = req.body;

            // Đảm bảo quantity là số và lớn hơn 0
            const qty = parseInt(quantity);
            if (isNaN(qty) || qty < 1) {
                return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
            }

            console.log('Updating cart item quantity:', { userId, itemId, qty });

            // Tìm giỏ hàng
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng' });
            }

            // Tìm sản phẩm trong giỏ hàng
            const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
            if (itemIndex === -1) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            // Lấy thông tin sản phẩm để kiểm tra tồn kho
            const product = await Product.findById(cart.items[itemIndex].productId).lean();
            if (!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin sản phẩm' });
            }

            // Tính tồn kho
            const stockCount = await Product.countDocuments({
                import: product.import,
                status: { $in: ['IN_STOCK', 'ON_SALE'] }
            });

            // Kiểm tra số lượng tồn kho
            if (!stockCount || stockCount <= 0) {
                return res.status(400).json({ success: false, message: 'Sản phẩm đã hết hàng' });
            }

            // Kiểm tra nếu số lượng yêu cầu vượt quá số lượng tồn kho
            if (qty > stockCount) {
                return res.status(400).json({
                    success: false,
                    message: `Chỉ còn ${stockCount} sản phẩm trong kho`,
                    availableStock: stockCount
                });
            }

            // Cập nhật số lượng
            cart.items[itemIndex].quantity = qty;
            await cart.save();

            // Tính lại tổng tiền của sản phẩm
            const total = qty * (product?.sellPrice || 0);

            // Tính lại tổng tiền của giỏ hàng
            let subtotal = 0;
            for (const item of cart.items) {
                const prod = await Product.findById(item.productId).lean();
                subtotal += item.quantity * (prod?.sellPrice || 0);
            }

            // Tính tổng số lượng sản phẩm trong giỏ hàng
            const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

            return res.json({
                success: true,
                message: 'Cập nhật số lượng thành công',
                itemTotal: total,
                subtotal: subtotal,
                cartCount: cartCount
            });
        } catch (error) {
            console.error('Error in updateItemQuantity:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi cập nhật số lượng',
                error: error.message
            });
        }
    }
}

module.exports = new CartController();