const express = require("express");
const router = express.Router();
const ForgotController = require("../controllers/forgot.controller");

router.get("/verifyOTP", (req, res) => {
    const message = req.session.message || null;
    req.session.message = null; // Xóa thông báo sau khi hiển thị
    res.render("verifyOTP", {
        message,
        isSuccess: true
    });
})

router.get("/resetPassword", (req, res) => {
    const message = req.session.message || null;
    req.session.message = null; // Xóa thông báo sau khi hiển thị
    res.render("resetPassword", {
        message,
        isSuccess: true
    });
})

// Gửi mã OTP
router.post("/forgot-password/send-otp", ForgotController.sendOTP);

// Xác minh mã OTP
router.post("/forgot-password/verify-otp", ForgotController.verifyOTP);

// Đặt lại mật khẩu
router.post("/forgot-password/reset-password", ForgotController.resetPassword);

module.exports = router;