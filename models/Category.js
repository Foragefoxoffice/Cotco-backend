const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true }, // ✅ always required
    vn: { type: String, trim: true }, // ✅ optional
  },
  description: {
    en: { type: String, default: "" },
    vn: { type: String, default: "" },
  },
  slug: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
