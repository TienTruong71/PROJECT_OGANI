const Support = require("../../models/support.model.js");
const ResponseSupport = require("../../models/responseSupport.js");
const mongoose = require("mongoose");

class adminSupportController {
  async support(req, res) {
    const user = req.session.user || null;

    try {
      // Lấy danh sách các yêu cầu hỗ trợ và thông tin phản hồi
      const supports = await Support.find()
        .populate('customer.userId', 'fullName emailAddress')  // Lấy thông tin khách hàng từ User
        .populate('responses')  // Lấy thông tin phản hồi từ ResponseSupport
        .exec();

      const formattedSupports = supports.map(support => ({
        ...support.toObject(),
        formattedDate: support.createdAt.toLocaleDateString(),
        responses: support.responses || []
      }));

      res.render("admin/manage_support", {
        pageTitle: "Trang Admin",
        user,
        supports: formattedSupports
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hỗ trợ:", error);
      res.status(500).send("Có lỗi xảy ra trong khi lấy dữ liệu hỗ trợ.");
    }
  }

  async replySupport(req, res) {
    try {
      const { id, reply, title } = req.body;  // Lấy thêm trường title
  
      // Kiểm tra xem id có hợp lệ hay không
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ" });
      }
  
      // Kiểm tra nếu không có phản hồi hoặc không có title
      if (!reply || !reply.trim()) {
        return res.status(400).json({ success: false, message: "Phản hồi không được để trống" });
      }
  
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: "Tiêu đề phản hồi là bắt buộc" });
      }
  
      console.log("Received ID:", id);  // Log ID nhận được từ client
  
      // Tìm yêu cầu hỗ trợ từ database
      const support = await Support.findById(id);
      if (!support) {
        return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu hỗ trợ" });
      }
  
      // Tiến hành tạo phản hồi và lưu vào cơ sở dữ liệu
      const response = new ResponseSupport({
        supportId: id,
        content: reply,
        title: title,  // Gán title vào phản hồi
        createdAt: new Date()
      });
  
      await response.save();
      support.responses.push(response);
      await support.save();
  
      res.json({ success: true, message: "Phản hồi đã được gửi thành công" });
    } catch (error) {
      console.error("Lỗi khi phản hồi hỗ trợ:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
}

module.exports = new adminSupportController();
