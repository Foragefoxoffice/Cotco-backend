const mongoose = require("mongoose");

const mainCategorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    vn: { type: String, trim: true },
  },
  description: {
    en: { type: String, default: "" },
    vn: { type: String, default: "" },
  },
  slug: { type: String, required: true, unique: true, trim: true },
  image: { type: String, default: "" }, // optional main category image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MainCategory", mainCategorySchema);
