const express = require("express");
const router = express.Router();
const AuthController = require ("../controllers/auth.controller")

// Route GET /login: Render trang login
router.get("/login", (req, res) => {
    const message = req.session.message || null;
    const isSuccess = req.session.isSuccess || null;
    req.session.isSuccess = null;
    req.session.message = null; // Xóa thông báo sau khi hiển thị
    res.render("login", {
        message,
        isSuccess
    });
});

// Route POST /login: Xử lý logic đăng nhập
router.post("/login", AuthController.login);

// Route POST /signup: Xử lý logic đăng ký
router.post("/signup", AuthController.signup);

router.get("/logout", AuthController.logout);


module.exports = router;