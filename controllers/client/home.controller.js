const Product = require("../../models/product.model");
const Category = require("../../models/category.model");

const listPaginated = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const products = await Product.find({ active: "active" })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalProducts = await Product.countDocuments({ active: "active" });
    return { products, totalProducts };
  } catch (err) {
    console.error("❌ Lỗi khi phân trang sản phẩm:", err);
    throw err;
  }
};

module.exports.index = async (req, res) => {
  try {
    const user = req.session.user || null;
    const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
    const limit = 12; // Số sản phẩm mỗi trang
    const skip = (page - 1) * limit; // Số sản phẩm cần bỏ qua

    // Lấy sản phẩm từ database với phân trang
    const allProducts = await Product.find({ active: "active" })
      .skip(skip)
      .limit(limit)
      .lean();

    // Tổng số sản phẩm
    const totalProducts = await Product.countDocuments({ active: "active" });
    const totalPages = Math.ceil(totalProducts / limit); // Tổng số trang

    // Lấy danh sách tất cả danh mục có trạng thái 'active'
    const listCat = await Category.find({ status: "active" }).lean();

    // Loại bỏ sản phẩm trùng theo cặp 'title' và 'import'
    const seen = new Set();
    const listPro = allProducts.filter(product => {
      const key = `${product.title}-${product.import}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Render trang chủ
    res.render("client/pages/home", {
      layout: "main",
      pageTitle: "Trang chủ",
      user,
      listPro,
      listCat,
      breadcrumb: "Trang chủ",
      currentPage: "home",
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải trang chủ:", error);
    res.status(500).send("Lỗi server khi tải trang chủ");
  }
};
