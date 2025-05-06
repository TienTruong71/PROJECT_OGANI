const Category = require("../../models/category.model");
const Product = require("../../models/product.model");
class AdminCateController {
  async category(req, res) {
    try {
      const user = req.session.user || null;
      const categories = await Category.find().lean();
      console.log("Danh sách danh mục:", categories);

      res.render("admin/manage_category", {
        pageTitle: "Category Management",
        user,
        categories
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách danh mục:", error);
      res.send("Đã xảy ra lỗi khi lấy danh sách danh mục");
    }
  }

  async addForm(req, res) {
    try {
      const user = req.session.user || null;

      res.render("admin/category_add", {
        pageTitle: "Thêm danh mục",
        user
      });
    } catch (error) {
      console.error("Lỗi hiển thị form thêm danh mục:", error);
      res.status(500).send("Đã xảy ra lỗi khi hiển thị form thêm danh mục.");
    }
  }

  async addSave(req, res) {
    try {
      const { categoryName, status, thumbnail } = req.body;
      const existing = await Category.findOne({ categoryName });
      if (existing) {
        return res.render("admin/category_add", {
          user: req.session.user,
          errorMessage: "Tên danh mục đã tồn tại!",
          categoryName,
          status,
          thumbnail 
        });
      }
      const newCategory = new Category({ categoryName, status, thumbnail });
      await newCategory.save();
      res.redirect("/admin/category");
    } catch (err) {
      console.error("Lỗi khi thêm danh mục:", err);
      res.status(500).send("Đã xảy ra lỗi khi thêm danh mục mới.");
    }
  }

  
  async delete(req, res) {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.redirect("/admin/category");
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err);
      res.send("Đã xảy ra lỗi khi xóa tài khoản.");
    }
  }

  async viewProductsByCategory(req, res) {
    try {
      const user = req.session.user || null;
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId).lean();
      if (!category) {
        return res.status(404).send("Category not found");
      }

      // Lấy danh sách sản phẩm đại diện (gộp theo import)
      const allProducts = await Product.find({ categoryId }).lean();

      // Nhóm theo import và chọn 1 bản đại diện + đếm số lượng còn lại
      const productMap = new Map();

      for (const product of allProducts) {
        if (!productMap.has(product.import)) {
          productMap.set(product.import, {
            ...product,
            quantity: 0,
          });
        }
        if (product.status === "IN_STOCK") {
          productMap.get(product.import).quantity++;
        }
      }

      const groupedProducts = Array.from(productMap.values());

      res.render("admin/category_view_product", {
        pageTitle: `Products in ${category.categoryName}`,
        user,
        category,
        products: groupedProducts,
      });
    } catch (error) {
      console.error("Error fetching category products:", error);
      res.status(500).send("Server error");
    }
  }

  async showEditForm(req, res) {
    try {
      const category = await Category.findById(req.params.id).lean();
      if (!category) {
        return res.redirect("/admin/category");
      }
  
      res.render("admin/category_edit", {
        user: req.session.user,
        category
      });
    } catch (err) {
      console.error("Lỗi khi hiển thị form chỉnh sửa:", err);
      res.status(500).send("Lỗi server");
    }
  }

  async updateCategory(req, res) {
    try {
      const { categoryName, status, thumbnail } = req.body;
      await Category.findByIdAndUpdate(req.params.id, {
        categoryName,
        status,
        thumbnail
      });
  
      res.redirect("/admin/category");
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục:", err);
      res.status(500).send("Lỗi server khi cập nhật");
    }
  }
  

}

module.exports = new AdminCateController();