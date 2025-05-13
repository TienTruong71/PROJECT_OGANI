const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Category" },
  description: { type: String },
  sellPrice: { type: Number, required: true },
  mfg: { type: Date },
  exp: { type: Date },
  producer: { type: String },
  status: { type: String, enum: ["IN_STOCK", "OUT_OF_DATE", "SOLD", "ON_SALE"], default: "IN_STOCK" },
  active: { type: String, enum: ["active", "inactive"], default: "active" },
  sellDate: { type: Date },
  import: { type: String, required: true },
  thumbnail: { type: String },
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);




