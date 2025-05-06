const mongoose = require("mongoose");
const User = require("./user.model.js"); // Đảm bảo bạn đã require mô hình User
const ResponseSupport = require("./responseSupport.js");

const supportSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Tham chiếu đến mô hình User
    required: true  // Có thể thêm required nếu muốn yêu cầu trường này là bắt buộc
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  responses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ResponseSupport"
  }]
});

const Support = mongoose.model("Support", supportSchema, "support");

module.exports = Support;
