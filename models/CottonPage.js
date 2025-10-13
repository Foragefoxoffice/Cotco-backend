const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// 1️⃣ BANNER SECTION
const cottonBannerSchema = new mongoose.Schema(
  {
    cottonBannerImg: { type: String, default: "" },
    cottonBannerTitle: multiLangField,
    cottonBannerDes: multiLangField,
    cottonBannerOverview: multiLangField,
    cottonBannerSlideImg: [{ type: String, default: "" }],
  },
  { _id: false }
);

// 2️⃣ SUPPLIER SECTION (∞ Add)
const cottonSupplierSchema = new mongoose.Schema(
  {
    cottonSupplierTitle: multiLangField,
    cottonSupplierLogoName: multiLangField,
    cottonSupplierDes: [multiLangField],
    cottonSupplierLogo: { type: String, default: "" },
    cottonSupplierBg: { type: String, default: "" },
  },
  { _id: false }
);

// 3️⃣ TRUST SECTION
const cottonTrustSchema = new mongoose.Schema(
  {
    cottonTrustTitle: multiLangField,
    cottonTrustDes: multiLangField,
    cottonTrustLogo: [{ type: String, default: "" }],
    cottonTrustImg: { type: String, default: "" },
  },
  { _id: false }
);

// 4️⃣ MEMBER SECTION
const cottonMemberSchema = new mongoose.Schema(
  {
    cottonMemberTitle: multiLangField,
    cottonMemberButtonText: multiLangField,
    cottonMemberButtonLink: { type: String, default: "" },
    cottonMemberImg: [{ type: String, default: "" }],
  },
  { _id: false }
);

// 5️⃣ 🆕 SEO META SECTION
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

// 🔹 MAIN COTTON PAGE SCHEMA
const cottonPageSchema = new mongoose.Schema(
  {
    cottonBanner: cottonBannerSchema,
    cottonSupplier: [cottonSupplierSchema],
    cottonTrust: cottonTrustSchema,
    cottonMember: cottonMemberSchema,
    seoMeta: seoMetaSchema, // ✅ added for SEO panel support
  },
  { timestamps: true }
);

// 🧩 Prevent OverwriteModelError
module.exports =
  mongoose.models.CottonPage || mongoose.model("CottonPage", cottonPageSchema);
