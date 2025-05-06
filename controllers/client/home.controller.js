const Product = require("../../models/product.model");
const Category = require("../../models/category.model");

module.exports.index = async (req, res) => {
  try {
    const user = req.session.user || null;

    // Lấy tất cả sản phẩm từ database
    const allProducts = await Product.find({ active: "active" }).lean();

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
      currentPage: "home"
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải trang chủ:", error);
    res.status(500).send("Lỗi server khi tải trang chủ");
  }
};
