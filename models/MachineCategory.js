const mongoose = require("mongoose");

const MachineCategorySchema = new mongoose.Schema({
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory", // ✅ belongs to a MainCategory
    required: true,
  },
  name: {
    en: { type: String, required: true, trim: true },
    vn: { type: String, trim: true },
  },
  description: {
    en: { type: String, default: "" },
    vn: { type: String, default: "" },
  },
  slug: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: "" },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MachineCategory", MachineCategorySchema);
