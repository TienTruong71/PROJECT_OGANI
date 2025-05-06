const express = require('express');
const router = express.Router();
const catalogController = require('../../controllers/client/catalog.controller');


// Route để hiển thị tất cả danh mục
router.get('/', catalogController.index);

// Route để hiển thị sản phẩm theo danh mục
router.get('/:slug', catalogController.show);


module.exports = router;
