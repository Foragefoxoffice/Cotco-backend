const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// ================= HERO SECTION =================
const heroSchema = new mongoose.Schema(
  {
    bgType: { type: String, enum: ["image", "video"], default: "image" },
    bgUrl: { type: String, default: "" },
    heroTitle: multiLangField,
    heroDescription: multiLangField,
    heroButtonText: multiLangField,
    heroButtonLink: multiLangField,
  },
  { _id: false }
);

// ================= WHO WE ARE =================
const whoWeAreSchema = new mongoose.Schema(
  {
    whoWeAreheading: multiLangField,
    whoWeAredescription: multiLangField,
    whoWeArebannerImage: { type: String, default: "" },
    whoWeArebuttonText: multiLangField,
    whoWeArebuttonLink: multiLangField,
  },
  { _id: false }
);

// ================= WHAT WE DO =================
const whatWeDoSchema = new mongoose.Schema(
  {
    whatWeDoTitle: multiLangField,
    whatWeDoDec: multiLangField,

    whatWeDoIcon1: { type: String, default: "" },
    whatWeDoIcon2: { type: String, default: "" },
    whatWeDoIcon3: { type: String, default: "" },

    whatWeDoImg1: { type: String, default: "" },
    whatWeDoImg2: { type: String, default: "" },
    whatWeDoImg3: { type: String, default: "" },

    whatWeDoTitle1: multiLangField,
    whatWeDoTitle2: multiLangField,
    whatWeDoTitle3: multiLangField,

    whatWeDoDes1: multiLangField,
    whatWeDoDes2: multiLangField,
    whatWeDoDes3: multiLangField,
  },
  { _id: false }
);

// ================= COMPANY LOGOS =================
const companyLogosSchema = new mongoose.Schema(
  {
    companyLogosHeading: multiLangField,
    logos: [
      {
        url: { type: String, default: "" },
      },
    ],
  },
  { _id: false }
);

// ================= DEFINED US =================
const definedUsSchema = new mongoose.Schema(
  {
    definedUsHeading: multiLangField,

    definedUsLogo1: { type: String, default: "" },
    definedUsTitle1: multiLangField,
    definedUsDes1: multiLangField,

    definedUsLogo2: { type: String, default: "" },
    definedUsTitle2: multiLangField,
    definedUsDes2: multiLangField,

    definedUsLogo3: { type: String, default: "" },
    definedUsTitle3: multiLangField,
    definedUsDes3: multiLangField,

    definedUsLogo4: { type: String, default: "" },
    definedUsTitle4: multiLangField,
    definedUsDes4: multiLangField,

    definedUsLogo5: { type: String, default: "" },
    definedUsTitle5: multiLangField,
    definedUsDes5: multiLangField,

    definedUsLogo6: { type: String, default: "" },
    definedUsTitle6: multiLangField,
    definedUsDes6: multiLangField,
  },
  { _id: false }
);

// ================= CORE VALUES =================
const coreValuesSchema = new mongoose.Schema(
  {
    coreTitle: multiLangField,
    coreTitle1: multiLangField,
    coreDes1: multiLangField,
    coreTitle2: multiLangField,
    coreDes2: multiLangField,
    coreTitle3: multiLangField,
    coreDes3: multiLangField,
    coreTitle4: multiLangField,
    coreDes4: multiLangField,
    coreImage: { type: String, default: "" },
  },
  { _id: false }
);

// ================= BLOG SECTION =================
const blogSchema = new mongoose.Schema(
  {
    blogTitle: multiLangField,
    blogDescription: multiLangField,
    blogImage: { type: String, default: "" },
  },
  { _id: false }
);

// ================= BANNER SECTION =================
const bannerSchema = new mongoose.Schema(
  {
    bannerTitle1: multiLangField,
    bannerTitle2: multiLangField,
    bannerButtonText: multiLangField,
    bannerButtonLink: { type: String, default: "" },
    bannerBackgroundImage: { type: String, default: "" },
  },
  { _id: false }
);

// ================= SEO META (Simplified) =================
const seoMetaSchema = new mongoose.Schema(
  {
    metaTitle: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
    metaDescription: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
    metaKeywords: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
  },
  { _id: false }
);


// ================= MAIN HOMEPAGE SCHEMA =================
const homepageSchema = new mongoose.Schema(
  {
    heroSection: heroSchema,
    whoWeAreSection: whoWeAreSchema,
    whatWeDoSection: whatWeDoSchema,
    companyLogosSection: companyLogosSchema,
    definedUsSection: definedUsSchema,
    coreValuesSection: coreValuesSchema,
    blogSection: blogSchema,
    bannerSection: bannerSchema,
    seoMeta: seoMetaSchema, // ✅ only 3 fields now
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homepage", homepageSchema);

