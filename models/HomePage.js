const mongoose = require("mongoose");

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

const heroSchema = new mongoose.Schema(
  {
    bgType: { type: String, enum: ["image", "video"], default: "image" },
    bgUrl: { type: String },
    heroTitle: multiLangField,
    heroDescription: multiLangField,
    heroButtonText: multiLangField,
    heroButtonLink: multiLangField,
  },
  { _id: false }
);

const whoWeAreSchema = new mongoose.Schema(
  {
    whoWeAreheading: multiLangField,
    whoWeAredescription: multiLangField,
    whoWeArebannerImage: { type: String },
    whoWeArebuttonText: multiLangField,
    whoWeArebuttonLink: multiLangField,
  },
  { _id: false }
);

const whatWeDoSchema = new mongoose.Schema(
  {
    whatWeDoTitle: multiLangField,
    whatWeDoDec: multiLangField,

    whatWeDoIcon1: { type: String },
    whatWeDoIcon2: { type: String },
    whatWeDoIcon3: { type: String },

    whatWeDoImg1: { type: String },
    whatWeDoImg2: { type: String },
    whatWeDoImg3: { type: String },

    whatWeDoTitle1: multiLangField,
    whatWeDoTitle2: multiLangField,
    whatWeDoTitle3: multiLangField,

    whatWeDoDes1: multiLangField,
    whatWeDoDes2: multiLangField,
    whatWeDoDes3: multiLangField,
  },
  { _id: false }
);

const companyLogosSchema = new mongoose.Schema(
  {
    companyLogo1: { type: String },
    companyLogo2: { type: String },
    companyLogo3: { type: String },
    companyLogo4: { type: String },
    companyLogo5: { type: String },
    companyLogo6: { type: String },
  },
  { _id: false }
);

const definedUsSchema = new mongoose.Schema(
  {
    definedUsLogo1: { type: String },
    definedUsTitle1: multiLangField,
    definedUsDes1: multiLangField,

    definedUsLogo2: { type: String },
    definedUsTitle2: multiLangField,
    definedUsDes2: multiLangField,

    definedUsLogo3: { type: String },
    definedUsTitle3: multiLangField,
    definedUsDes3: multiLangField,

    definedUsLogo4: { type: String },
    definedUsTitle4: multiLangField,
    definedUsDes4: multiLangField,

    definedUsLogo5: { type: String },
    definedUsTitle5: multiLangField,
    definedUsDes5: multiLangField,

    definedUsLogo6: { type: String },
    definedUsTitle6: multiLangField,
    definedUsDes6: multiLangField,
  },
  { _id: false }
);

const coreValuesSchema = new mongoose.Schema(
  {
    coreTitle: multiLangField, // 🔄 changed from String → multiLangField

    coreTitle1: multiLangField,
    coreDes1: multiLangField,

    coreTitle2: multiLangField,
    coreDes2: multiLangField,

    coreTitle3: multiLangField,
    coreDes3: multiLangField,

    coreTitle4: multiLangField,
    coreDes4: multiLangField,

    coreImage: { type: String },
  },
  { _id: false }
);

const homepageSchema = new mongoose.Schema(
  {
    heroSection: heroSchema,
    whoWeAreSection: whoWeAreSchema,
    whatWeDoSection: whatWeDoSchema,
    companyLogosSection: companyLogosSchema,
    definedUsSection: definedUsSchema, // ✅ new section
    coreValuesSection: coreValuesSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homepage", homepageSchema);
