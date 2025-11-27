const mongoose = require("mongoose");

const MachineCategorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    vi: { type: String, trim: true },
  },
  description: {
    en: { type: String, default: "" },
    vi: { type: String, default: "" },
  },
  slug: { type: String, required: true, unique: true, trim: true },

  // ✅ New fields
  createMachineCatTitle: {
    en: { type: String, default: "" },
    vi: { type: String, default: "" },
  },
  createMachineCatDes: {
    en: { type: String, default: "" },
    vi: { type: String, default: "" },
  },
  createMachineCatBgImage: { type: String, default: "" }, // Base64 background image

  icon: { type: String, default: "" },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MachineCategory", MachineCategorySchema);
