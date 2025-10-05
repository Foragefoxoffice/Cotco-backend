const mongoose = require("mongoose");

const mainCategorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    vn: { type: String, trim: true },
  },
  slug: { type: String, required: true, unique: true, trim: true },
  bgImage: {
    url: { type: String, trim: true }, // store uploaded image URL or CDN path
    alt: { type: String, trim: true }, // optional alt text for accessibility
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MainCategory", mainCategorySchema);
