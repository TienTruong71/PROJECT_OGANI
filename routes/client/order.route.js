const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');

// Hiển thị trang thanh toán
router.get('/checkout', orderController.showCheckout);

// Xử lý đặt hàng
router.post('/place-order', orderController.placeOrder);

// Hiển thị chi tiết đơn hàng
router.get('/detail/:orderId', orderController.showOrderDetail);

// Hiển thị lịch sử đơn hàng
router.get('/history', orderController.showOrderHistory);

// Hủy đơn hàng
router.post('/cancel/:orderId', orderController.cancelOrder);

module.exports = router;
