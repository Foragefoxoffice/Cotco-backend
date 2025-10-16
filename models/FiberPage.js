const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1️⃣ Banner Section */
const fiberBannerSchema = new mongoose.Schema(
  {
    fiberBannerMedia: { type: String, default: "" }, // image or video
    fiberBannerTitle: multiLangField,
    fiberBannerDes: multiLangField,
    fiberBannerContent: multiLangField,
    fiberBannerSubTitle: multiLangField,
    fiberBannerImg: { type: String, default: "" },
  },
  { _id: false }
);

/* 2️⃣ Sustainability Section */
const fiberSustainabilitySchema = new mongoose.Schema(
  {
    fiberSustainabilityTitle: multiLangField,
    fiberSustainabilitySubText: multiLangField,
    fiberSustainabilityDes: multiLangField,
    fiberSustainabilityImg: { type: String, default: "" },
    fiberSustainabilitySubTitle1: multiLangField,
    fiberSustainabilitySubDes1: multiLangField,
    fiberSustainabilitySubTitle2: multiLangField,
    fiberSustainabilitySubDes2: multiLangField,
    fiberSustainabilitySubTitle3: multiLangField,
    fiberSustainabilitySubDes3: multiLangField,
  },
  { _id: false }
);

/* 3️⃣ Choose Us Section */
const fiberChooseUsBoxSchema = new mongoose.Schema(
  {
    fiberChooseUsBoxBg: { type: String, default: "" },
    fiberChooseUsIcon: { type: String, default: "" }, // from icon plugin
    fiberChooseUsBoxTitle: multiLangField,
    fiberChooseUsDes: multiLangField,
  },
  { _id: false }
);

const fiberChooseUsSchema = new mongoose.Schema(
  {
    fiberChooseUsTitle: multiLangField,
    fiberChooseUsDes: multiLangField,
    fiberChooseUsBox: [fiberChooseUsBoxSchema],
  },
  { _id: false }
);

/* 4️⃣ Supplier Section */
const fiberSupplierSchema = new mongoose.Schema(
  {
    fiberSupplierTitle: multiLangField,
    fiberSupplierDes: [multiLangField], // list
    fiberSupplierImg: [{ type: String, default: "" }], // infinite add
  },
  { _id: false }
);

/* 5️⃣ Products Section */
const fiberProductSchema = new mongoose.Schema(
  {
    fiberProductTitle: multiLangField,
    fiberProductDes: [multiLangField],
    fiberProductImg: { type: String, default: "" },
  },
  { _id: false }
);

const fiberProductsSchema = new mongoose.Schema(
  {
    fiberProduct: [fiberProductSchema], // multiple products
    fiberProductBottomCon: multiLangField,
    fiberProductButtonText: multiLangField,
    fiberProductButtonLink: { type: String, default: "" },
  },
  { _id: false }
);

/* 7️⃣ Fiber Team Section */
const fiberTeamMemberSchema = new mongoose.Schema(
  {
    teamName: multiLangField,
    teamDesgn: multiLangField,
    teamEmail: { type: String, default: "" },
    teamPhone: { type: String, default: "" }, // ✅ NEW FIELD
  },
  { _id: false }
);


const fiberTeamGroupSchema = new mongoose.Schema(
  {
    teamLabel: multiLangField,
    members: [fiberTeamMemberSchema],
  },
  { _id: false }
);

const fiberTeamSchema = new mongoose.Schema(
  {
    aboutTeamIntro: {
      tag: multiLangField,
      heading: multiLangField,
      description: multiLangField,
    },
    aboutTeam: {
      type: Map,
      of: fiberTeamGroupSchema,
      default: {},
    },
  },
  { _id: false }
);

/* 6️⃣ Certification Section */
const fiberCertificationSchema = new mongoose.Schema(
  {
    fiberCertificationTitle: multiLangField,
    fiberCertificationButtonText: multiLangField,
    fiberCertificationButtonLink: { type: String, default: "" },
    fiberCertificationImg: [{ type: String, default: "" }],
  },
  { _id: false }
);

/* 7️⃣ 🆕 SEO META Section */
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

/* 🧩 MAIN FIBER PAGE SCHEMA */
const fiberPageSchema = new mongoose.Schema(
  {
    fiberBanner: fiberBannerSchema,
    fiberSustainability: fiberSustainabilitySchema,
    fiberChooseUs: fiberChooseUsSchema,
    fiberSupplier: fiberSupplierSchema,
    fiberProducts: fiberProductsSchema,
    fiberCertification: fiberCertificationSchema,
    fiberTeam: fiberTeamSchema,
    seoMeta: seoMetaSchema, // ✅ added SEO meta section
  },
  { timestamps: true }
);

// 🔄 Prevent OverwriteModelError
module.exports =
  mongoose.models.FiberPage || mongoose.model("FiberPage", fiberPageSchema);
