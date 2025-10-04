const mongoose = require("mongoose");

// Reusable multilingual rich text
const multiLangRichText = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// Banner schema
const termsBannerSchema = new mongoose.Schema(
  {
    termsBannerMedia: { type: String, default: "" }, // file path (image/video)
    termsBannerTitle: multiLangField,
  },
  { _id: false }
);

const termsConditionsPageSchema = new mongoose.Schema(
  {
    termsBanner: termsBannerSchema,
    termsConditionsContent: multiLangRichText, // ✅ One long multilingual field
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TermsConditionsPage ||
  mongoose.model("TermsConditionsPage", termsConditionsPageSchema);
