module.exports = {
    checkAdminRole: (req, res, next) => {
        const user = req.session.user;

        // Kiểm tra nếu người dùng chưa đăng nhập hoặc không phải Admin
        if (!user || (user.role !== 2 && user.role !== 3)) {
            return res.status(403).render("error", { message: "Bạn không có quyền truy cập vào trang này." });
        }

        next(); // Cho phép tiếp tục nếu role hợp lệ
    },
};