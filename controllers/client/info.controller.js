const path = require('path');
const User = require('../../models/user.model');

class InfoController {
    async showInfo(req, res) {
        try {
            // Kiểm tra người dùng đã đăng nhập chưa
            if (!req.session.user) {
                return res.redirect('/login');
            }
            
            const userId = req.session.user._id;
            
            // Lấy thông tin chi tiết của người dùng từ database
            const userDoc = await User.findById(userId);
            
            if (!userDoc) {
                return res.status(404).send('Không tìm thấy thông tin người dùng');
            }

            // Verify session token
            if (userDoc.sessionToken && userDoc.sessionToken !== req.session.sessionToken) {
                req.session.destroy();
                return res.redirect('/login');
            }
            
            // Chuyển đổi Mongoose document thành JavaScript object thông thường
            const user = userDoc.toObject();
            
            // Định dạng ngày tháng để hiển thị
            let formattedDOB = '';
            if (user.dateOfBirth) {
                const dob = new Date(user.dateOfBirth);
                formattedDOB = dob.toISOString().split('T')[0]; // Format YYYY-MM-DD
            }
            
            // Thêm message từ session nếu có
            const message = req.session.message;
            req.session.message = null; // Xóa message sau khi đã sử dụng
            
            // Render trang thông tin người dùng với dữ liệu và chỉ định layout
            res.render('client/pages/user-info', {
                user: user,
                formattedDOB: formattedDOB,
                genderText: user.gender === 1 ? 'Nam' : 'Nữ',
                pageTitle: 'Thông tin cá nhân',
                layout: 'main', // Chỉ định sử dụng layout main.hbs
                message: message
            });
        } catch (error) {
            console.error('Error in showInfo:', error);
            res.status(500).send('Đã xảy ra lỗi khi tải thông tin người dùng');
        }
    }
    
    async updateInfo(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            
            const userId = req.session.user._id;
            
            // Log dữ liệu được gửi từ form
            console.log('User ID:', userId);
            console.log('Form data:', req.body);
            
            // Nếu req.body trống, có thể là vấn đề với body-parser
            if (!req.body || Object.keys(req.body).length === 0) {
                console.error('Form data is empty. Check body-parser configuration.');
                req.session.message = { type: 'error', text: 'Không nhận được dữ liệu từ form. Vui lòng thử lại.' };
                return res.redirect('/info');
            }
            
            const { fullName, phoneNumber, address, gender, dateOfBirth } = req.body;
            
            // Đảm bảo fullName không trống
            if (!fullName || fullName.trim() === '') {
                req.session.message = { type: 'error', text: 'Họ và tên không được để trống' };
                return res.redirect('/info');
            }
            
            // Tạo đối tượng chứa thông tin cần cập nhật
            const updateData = {
                fullName: fullName.trim(),
                phoneNumber: phoneNumber ? phoneNumber.trim() : '',
                address: address ? address.trim() : '',
                gender: gender ? parseInt(gender) : 1,
                dateOfBirth: dateOfBirth || null
            };
            
            console.log('Update data:', updateData);
            
            // Sử dụng updateOne thay vì findByIdAndUpdate để tránh validation
            const result = await User.updateOne(
                { _id: userId },
                updateData
            );
            
            console.log('Update result:', result);
            
            if (result.matchedCount === 0) {
                console.error('User not found');
                req.session.message = { type: 'error', text: 'Không tìm thấy người dùng' };
                return res.redirect('/info');
            }
            
            // Cập nhật thông tin trong session
            const updatedUserDoc = await User.findById(userId);
            req.session.user = updatedUserDoc.toObject();
            
            // Chuyển hướng về trang thông tin với thông báo thành công
            req.session.message = { type: 'success', text: 'Cập nhật thông tin thành công' };
            res.redirect('/info');
        } catch (error) {
            console.error('Error in updateInfo:', error);
            req.session.message = { type: 'error', text: 'Đã xảy ra lỗi khi cập nhật thông tin: ' + error.message };
            res.redirect('/info');
        }
    }
    
    async changePassword(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            
            const userId = req.session.user._id;
            const { password, password1, password2 } = req.body;
            
            // Lấy thông tin người dùng
            const user = await User.findById(userId);
            
            // Kiểm tra mật khẩu cũ
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                req.session.message = { type: 'error', text: 'Mật khẩu cũ không đúng' };
                return res.redirect('/info');
            }
            
            // Kiểm tra mật khẩu mới và xác nhận mật khẩu
            if (password1 !== password2) {
                req.session.message = { type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp' };
                return res.redirect('/info');
            }
            
            // Cập nhật mật khẩu
            user.password = password1;
            await user.save();
            
            req.session.message = { type: 'success', text: 'Đổi mật khẩu thành công' };
            res.redirect('/info');
        } catch (error) {
            console.error('Error in changePassword:', error);
            req.session.message = { type: 'error', text: 'Đã xảy ra lỗi khi đổi mật khẩu' };
            res.redirect('/info');
        }
    }
}

module.exports = new InfoController();