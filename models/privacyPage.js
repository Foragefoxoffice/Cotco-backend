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
const privacyBannerSchema = new mongoose.Schema(
  {
    privacyBannerMedia: { type: String, default: "" }, // file path (image/video)
    privacyBannerTitle: multiLangField,
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    content: multiLangRichText,
  },
  { _id: false }
);

const privacyPageSchema = new mongoose.Schema(
  {
    privacyBanner: privacyBannerSchema,
    generalInformation: sectionSchema,
    website: sectionSchema,
    cookies: sectionSchema,
    socialMedia: sectionSchema,
    app: sectionSchema,
    integration: sectionSchema,
    changesPrivacy: sectionSchema,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PrivacyPage ||
  mongoose.model("PrivacyPage", privacyPageSchema);
