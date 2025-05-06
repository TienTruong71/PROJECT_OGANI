const Category = require('../../models/category.model.js');
const Product = require('../../models/product.model.js');

// =============================
// Các hàm tiện ích
// =============================

// Lấy danh sách sản phẩm theo categoryId
const findProductsByCategory = async (categoryId) => {
  try {
    return await Product.find({ categoryId, active: "active" }).lean();
  } catch (err) {
    console.error("❌ Error finding Products by category:", err);
    throw err;
  }
};

// Lọc các sản phẩm duy nhất (không trùng lặp)
const getUniqueProducts = (products) => {
  const seen = new Set();
  return products.filter(item => {
    const key = `${item.title}-${item.import}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// =============================
// Controller
// =============================

class CatalogController {
  // Hiển thị danh sách tất cả danh mục sản phẩm
  async index(req, res) {
    try {
      const user = req.session.user || null;
      const catalogList = res.locals.catalogList; // Lấy danh sách danh mục từ middleware;
      res.render("client/pages/shop-grid", {
        layout: "main",
        pageTitle: "Danh mục sản phẩm",
        catalogList,
        user,
        currentPage: "catalog"
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Hiển thị sản phẩm theo danh mục
  async show(req, res) {
    const categorySlug = req.params.slug;
    const user = req.session.user || null;

    try {
      const catalogList = res.locals.catalogList;
      const catalog = catalogList.find(cat => cat.slug === categorySlug);
      //


      if (!catalog) {
        return res.status(404).render('client/pages/404', {
          layout: "main",
          message: 'Danh mục không tồn tại',
          user,
          catalogList,

        });
      }

      // Lấy sản phẩm theo categoryId
      const products = await findProductsByCategory(catalog._id); // Sửa 'category' thành 'catalog'
      const uniqueProducts = getUniqueProducts(products); // Lọc các sản phẩm duy nhất

      res.render('client/pages/shop-grid', {
        layout: "main",
        pageTitle: catalog.categoryName,
        products: uniqueProducts,
        categorySlug,
        user,
        catalogList,
        currentPage: "catalog"
      });
    } catch (err) {
      console.error('Lỗi khi load sản phẩm theo danh mục:', err);
      res.status(500).send('Lỗi server');
    }
  }
}

module.exports = new CatalogController();
