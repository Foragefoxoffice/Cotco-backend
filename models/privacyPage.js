const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// ✅ Reusable multilingual rich text (for Quill editor content)
const multiLangRichText = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1️⃣ Banner Section */
const privacyBannerSchema = new mongoose.Schema(
  {
    privacyBannerMedia: { type: String, default: "" }, // file path (image/video)
    privacyBannerTitle: multiLangField,
  },
  { _id: false }
);

/* 2️⃣ Policy Section (∞ Add) */
const privacyPolicySchema = new mongoose.Schema(
  {
    policyTitle: multiLangField,
    policyContent: multiLangRichText, // supports HTML/RichText (ReactQuill)
  },
  { _id: false }
);

/* 3️⃣ 🆕 SEO Meta Section */
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

/* 🧩 MAIN PRIVACY PAGE SCHEMA */
const privacyPageSchema = new mongoose.Schema(
  {
    privacyBanner: privacyBannerSchema,
    privacyPolicies: [privacyPolicySchema],
    seoMeta: seoMetaSchema, // ✅ added SEO support
  },
  { timestamps: true }
);

// 🔄 Prevent OverwriteModelError
module.exports =
  mongoose.models.PrivacyPage ||
  mongoose.model("PrivacyPage", privacyPageSchema);
