const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: false },
    password: { type: String, required: true },
    role: { type: Number, default: 1, enum: [1, 2, 3] }, // 1: User, 2: Staff, 3: Manager
    fullName: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: Number, enum: [1, 2] }, // 1: Male, 2: Female
    phoneNumber: { type: String },
    address: { type: String },
    avatar: { type: String }, // Avatar nên để string (URL hoặc đường dẫn file)
    joinAt: { type: Date, default: Date.now }, // Ngày tham gia, mặc định là ngày hiện tại
    status: { type: String, enum: ["active", "locked"], default: "active" },
    rank: { type: String, enum: ["SILVER", "GOLD", "DIAMOND"],default: "SILVER"}
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;