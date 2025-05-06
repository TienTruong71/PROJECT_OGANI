const Product = require("../../models/product.model");
const { v4: uuidv4 } = require("uuid");

class AdminProductController {
    async showAddForm(req, res) {
        try {
            const user = req.session.user || null;
            const categoryId = req.query.categoryId;
            res.render("admin/product_add", {
                pageTitle: "Add Product",
                user,
                categoryId
            });
        } catch (err) {
          console.error("Error showing product form:", err);
          res.send("Error loading product form.");
        }
    }
    async addProduct(req, res) {
        try {
        const {title, categoryId, description, sellPrice, mfg, exp, producer, status, sellDate, thumbnail, quantity} = req.body;
        const importId = uuidv4(); // dùng chung cho các sản phẩm cùng lô
        const quantityNumber = parseInt(quantity);
        const slug = generateSlug(title);
        
        const products = [];
        for (let i = 0; i < quantityNumber; i++) {
            products.push({id: uuidv4(), title, slug, categoryId, description, sellPrice, mfg, exp, producer, status, sellDate, thumbnail, import: importId});
        }
        console.log("Dữ liệu sản phẩm chuẩn bị lưu:", products);
        await Product.insertMany(products);

        console.log(`Đã thêm ${quantityNumber} sản phẩm ${title}`);
        res.redirect(`/admin/category/view/${categoryId}`);
        } catch (err) {
        console.error("Lỗi khi thêm sản phẩm:", err);
        res.send("Đã xảy ra lỗi khi thêm sản phẩm.");
        }
    }

    async lockByImport(req, res) {
      try {
        const importId = req.params.importId;
        await Product.updateMany({ import: importId }, { active: "inactive" });
        res.redirect(req.get("Referrer") || "/");

      } catch (error) {
        console.error("Error locking products:", error);
        res.status(500).send("Internal server error");
      }
    }
  
    async unlockByImport(req, res) {
      try {
        const importId = req.params.importId;
        await Product.updateMany({ import: importId }, { active: "active" });
        res.redirect(req.get("Referrer") || "/");

      } catch (error) {
        console.error("Error unlocking products:", error);
        res.status(500).send("Internal server error");
      }
    }

    async deleteByImport(req, res) {
      try {
        const importId = req.params.importId;
        await Product.deleteMany({ import: importId });
        res.redirect(req.get("Referrer") || "/admin/category");
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm theo import:", error);
        res.status(500).send("Internal server error");
      }
    }
    
    async showEditForm(req, res) {
      try {
        const user = req.session.user || null;
        const importId = req.params.importId;
        const product = await Product.findOne({ import: importId }).lean(); // chỉ lấy đại diện
    
        if (!product) {
          return res.status(404).send("Không tìm thấy sản phẩm");
        }
    
        res.render("admin/product_edit", {
          pageTitle: "Edit Product",
          user,
          product,
        });
      } catch (error) {
        console.error("Lỗi hiển thị form chỉnh sửa:", error);
        res.status(500).send("Server error");
      }
    }

    async updateByImport(req, res) {
      try {
        const importId = req.params.importId;
        const { title, description, sellPrice, mfg, exp, producer, thumbnail, categoryId } = req.body;
        const slug = generateSlug(title);
        await Product.updateMany(
          { import: importId },
          {
            $set: {
              title,
              slug,
              description,
              sellPrice,
              mfg,
              exp,
              producer,
              thumbnail,
            },
          }
        );
    
        res.redirect(`/admin/category/view/${categoryId}`);
      } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        res.status(500).send("Server error");
      }
    }
}

function generateSlug(title, existingSlugs = []) {
  if (!title) return '';
  let slug = title.toLowerCase();
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  let uniqueSlug = slug;
  let counter = 1;
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter++}`;
  }
  return uniqueSlug;
}

module.exports = new AdminProductController();
