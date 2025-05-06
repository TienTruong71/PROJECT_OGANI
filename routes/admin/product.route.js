const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/product.controller");

router.get("/add", productController.showAddForm);
router.post("/add", productController.addProduct);
router.get("/lock/:importId", productController.lockByImport);
router.get("/unlock/:importId", productController.unlockByImport);
router.get("/edit/:importId", productController.showEditForm);
router.post("/update/:importId", productController.updateByImport);
router.get("/delete/:importId", productController.deleteByImport);
module.exports = router;
