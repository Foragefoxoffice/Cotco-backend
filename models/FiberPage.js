const mongoose = require("mongoose");

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1. Banner */
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

/* 2. Sustainability */
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

/* 3. Choose Us */
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

/* 4. Supplier */
const fiberSupplierSchema = new mongoose.Schema(
  {
    fiberSupplierTitle: multiLangField,
    fiberSupplierDes: [multiLangField], // list
    fiberSupplierImg: [{ type: String }], // infinity add
  },
  { _id: false }
);

/* 5. Product */
const fiberProductSchema = new mongoose.Schema(
  {
    fiberProductTitle: multiLangField,
    fiberProductDes: [multiLangField], // list
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

/* 6. Certification */
const fiberCertificationSchema = new mongoose.Schema(
  {
    fiberCertificationTitle: multiLangField,
    fiberCertificationButtonText: multiLangField,
    fiberCertificationButtonLink: { type: String, default: "" },
    fiberCertificationImg: [{ type: String }],
  },
  { _id: false }
);

/* Main Page */
const fiberPageSchema = new mongoose.Schema(
  {
    fiberBanner: fiberBannerSchema,
    fiberSustainability: fiberSustainabilitySchema,
    fiberChooseUs: fiberChooseUsSchema,
    fiberSupplier: fiberSupplierSchema,
    fiberProducts: fiberProductsSchema,
    fiberCertification: fiberCertificationSchema,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FiberPage || mongoose.model("FiberPage", fiberPageSchema);
