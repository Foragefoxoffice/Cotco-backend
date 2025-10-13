const mongoose = require("mongoose");

// ✅ Reusable multilingual rich text
const multiLangRichText = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// ✅ Reusable multilingual plain text field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1️⃣ Banner Section */
const termsBannerSchema = new mongoose.Schema(
  {
    termsBannerMedia: { type: String, default: "" }, // image or video path
    termsBannerTitle: multiLangField,
  },
  { _id: false }
);

/* 2️⃣ SEO Meta Section */
const seoMetaSchema = new mongoose.Schema(
  {
    metaTitle: multiLangField,
    metaDescription: multiLangField,
    metaKeywords: multiLangField,
    ogTitle: multiLangField,
    ogDescription: multiLangField,
    ogImage: { type: String, default: "" },
  },
  { _id: false }
);

/* 🧩 MAIN TERMS & CONDITIONS PAGE SCHEMA */
const termsConditionsPageSchema = new mongoose.Schema(
  {
    termsBanner: termsBannerSchema,
    termsConditionsContent: multiLangRichText, // ✅ Long multilingual content
    seoMeta: seoMetaSchema, // ✅ Added SEO section
  },
  { timestamps: true }
);

// 🔄 Prevent OverwriteModelError
module.exports =
  mongoose.models.TermsConditionsPage ||
  mongoose.model("TermsConditionsPage", termsConditionsPageSchema);
