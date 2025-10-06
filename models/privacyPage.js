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

// ✅ Privacy Policy schema (array)
const privacyPolicySchema = new mongoose.Schema(
  {
    policyTitle: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
    policyContent: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
  },
  { _id: false }
);

// ✅ Final model with only banner + policies
const privacyPageSchema = new mongoose.Schema(
  {
    privacyBanner: privacyBannerSchema,
    privacyPolicies: [privacyPolicySchema],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PrivacyPage ||
  mongoose.model("PrivacyPage", privacyPageSchema);
