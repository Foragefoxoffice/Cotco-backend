const mongoose = require("mongoose");
const machineSectionSchema = require("./MachineSection");

const machinePageSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MachineCategory",
    required: true,
  },
  title: {
    en: { type: String, required: true },
    vn: { type: String },
  },
  description: {
    en: { type: String },
    vn: { type: String },
  },
  slug: { type: String, required: true, unique: true },

  sections: { type: [machineSectionSchema], default: undefined },

  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [String],
    ogImage: { type: String },
  },

  banner: { type: String, default: undefined },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MachinePage", machinePageSchema);
