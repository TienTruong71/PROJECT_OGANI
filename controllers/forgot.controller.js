const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");

class ForgotController {
    async sendOTP (req, res) {
        try {
            const { emailAddress } = req.body

            const user = await User.findOne({ emailAddress });

            if (!user) {
                req.session.message = "Email không tồn tại";
                req.session.isSuccess = false;
                return res.redirect("/login");
            }

            const otp = crypto.randomInt(100000, 999999).toString();

            req.session.otp = otp;
            req.session.emailAddress = emailAddress;

            const transporter = nodemailer.createTransport({
                service : "gmail",
                auth: {
                    user: "rjack1356@gmail.com",
                    pass: "uhsw kifw dnxw gzfq"
                }
            })
            
            const mailOptions = {
                from: "bachhoaxanhdev@gmail.com",
                to: emailAddress,
                subject: "Mã OTP để khôi phục mật khẩu",
                text: `Mã OTP của bạn là ${otp}`
            }

            await transporter.sendMail(mailOptions)

            req.session.message = "Mã OTP đã được gửi tới email của bạn";
            res.redirect("/verifyOTP");
        } catch (error) {
            console.error("Lỗi khi gửi OTP:", error);
            
        }
    }

    async verifyOTP(req, res) {
        try {
            const { otp } = req.body;

            // Kiểm tra mã OTP
            if (req.session.otp !== otp) {
                return res.render("verifyOTP", { 
                    message: "Mã OTP không chính xác.",
                    isSuccess: false
                });
            }

            // Xóa mã OTP khỏi session sau khi xác minh thành công
            req.session.otp = null;

            req.session.message = "Mã OTP chính xác. Bạn có thể đặt lại mật khẩu.";
            res.redirect("/resetPassword");

        } catch (error) {
            console.error("Lỗi khi xác minh OTP:", error);
            res.status(500).json({ message: "Lỗi server.", error });
        }
        
    }

    async resetPassword(req, res) {
        try {
            const { newPassword, confirmPassword } = req.body;

            // Kiểm tra xem email có trong session không
            const emailAddress = req.session.emailAddress;
            if (!emailAddress) {
                return res.render("resetPassword", { 
                    message: "Không tìm thấy email để đặt lại mật khẩu.", 
                    isSuccess: false 
                });

            }

            if (newPassword !== confirmPassword) {
                return res.render("resetPassword", { 
                    message: "Mật khẩu và xác nhận mật khẩu không khớp.", 
                    isSuccess: false 
                });
            }

            // Cập nhật mật khẩu mới
            const user = await User.findOne({ emailAddress });
            user.password = newPassword; // Mã hóa mật khẩu nếu cần
            await user.save();

            // Xóa email khỏi session sau khi đặt lại mật khẩu thành công
            req.session.emailAddress = null;

            req.session.message = "Mật khẩu đã được đặt lại thành công.";
            req.session.isSuccess = true;
            res.redirect("/login");

        } catch (error) {
            console.error("Lỗi khi đặt lại mật khẩu:", error);
            res.status(500).json({ message: "Lỗi server.", error });
        }
    }
}

module.exports = new ForgotController();