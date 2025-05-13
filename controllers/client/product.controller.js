const Product = require("../../models/product.model");
const Cart = require('../../models/cart.model');

// =============================
// Các hàm tiện ích
// =============================

const list = async () => Product.find({ active: "active" }).lean();

const findBySlug = async (slug) => {
  try {
    return await Product.findOne({ slug, active: "active" }).lean();
  } catch (err) {
    console.error("❌ Lỗi khi tìm sản phẩm theo slug:", err);
    throw err;
  }
};
const findByName = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  return await Product.find({ title: regex }).lean();
};


const getUniqueProducts = (products) => {
  const seen = new Set();
  return products.filter(item => {
    const key = `${item.title}-${item.import}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

class ProductController {
  // Tìm kiếm sản phẩm
  async searchProduct(req, res) {
    const keyword = req.query.q || "";
    try {
      const result = await findByName(keyword);
      const uniqueProducts = getUniqueProducts(result);

      res.json(uniqueProducts.map(item => ({
        title: item.title,
        slug: item.slug,
      })));
    } catch (err) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", err);
      res.status(500).json({ error: "Lỗi tìm kiếm" });
    }
  }

  // Trang chi tiết sản phẩm
  async show(req, res, next) {
    const slug = req.params.slug;

    try {
      const product = await findBySlug(slug);
      if (!product) {
        return res.status(404).send("Không tìm thấy sản phẩm");
      }

      const allProducts = await list();
      const listPro = getUniqueProducts(allProducts);

      // Tính tồn kho
      const stockCount = await Product.countDocuments({
        import: product.import,
        status: { $in: ['IN_STOCK', 'ON_SALE'] }
      });
      product.stock = stockCount;
      const user = req.session.user || null;
      let cartCount = 0;
      if (user) {
        const cart = await Cart.findOne({ userId: user._id }).lean() || { items: [] };
        cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      }

      res.render('client/pages/product-details', {
        layout: 'main',
        pageTitle: "Product details",
        listPro,
        user,
        product,
        cartCount,
      });
    } catch (err) {
      console.error("Lỗi khi hiển thị sản phẩm:", err);
      res.status(500).send("Lỗi khi hiển thị sản phẩm");
    }
  }
}

module.exports = new ProductController();
