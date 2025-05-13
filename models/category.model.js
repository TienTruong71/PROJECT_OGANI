const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  slug: { type: String, slug: 'categoryName' },
  status: { type: String, enum: ['active', 'locked'], default: 'active' },
  thumbnail: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
