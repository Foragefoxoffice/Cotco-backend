const mongoose = require("mongoose");

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// Banner
const cottonBannerSchema = new mongoose.Schema(
  {
    cottonBannerImg: { type: String, default: "" },
    cottonBannerTitle: multiLangField,
    cottonBannerDes: multiLangField,
    cottonBannerOverview: multiLangField,
    cottonBannerSlideImg: [{ type: String }],
  },
  { _id: false }
);

// Supplier (∞ add)
const cottonSupplierSchema = new mongoose.Schema(
  {
    cottonSupplierTitle: multiLangField,
    cottonSupplierLogoName: multiLangField,
    cottonSupplierDes: multiLangField,
    cottonSupplierLogo: { type: String, default: "" },
    cottonSupplierBg: { type: String, default: "" }, // ✅ NEW
  },
  { _id: false }
);

// Trust
const cottonTrustSchema = new mongoose.Schema(
  {
    cottonTrustTitle: multiLangField,
    cottonTrustDes: multiLangField,
    cottonTrustLogo: [{ type: String }],
    cottonTrustImg: { type: String, default: "" },
  },
  { _id: false }
);

// Member
const cottonMemberSchema = new mongoose.Schema(
  {
    cottonMemberTitle: multiLangField,
    cottonMemberButtonText: multiLangField,
    cottonMemberButtonLink: { type: String, default: "" },
    cottonMemberImg: [{ type: String }],
  },
  { _id: false }
);

const cottonPageSchema = new mongoose.Schema(
  {
    cottonBanner: cottonBannerSchema,
    cottonSupplier: [cottonSupplierSchema],
    cottonTrust: cottonTrustSchema,
    cottonMember: cottonMemberSchema,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CottonPage || mongoose.model("CottonPage", cottonPageSchema);
