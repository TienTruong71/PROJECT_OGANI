const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { _id: false });

const responseSupportSchema = new mongoose.Schema({
    supportId: { type: mongoose.Schema.Types.ObjectId, ref: "Support" },
    staff: staffSchema, 
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ResponseSupport = mongoose.model("ResponseSupport", responseSupportSchema, "response_support");

module.exports = ResponseSupport;
