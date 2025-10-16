const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1️⃣ Banner Section */
const contactBannerSchema = new mongoose.Schema(
  {
    contactBannerBg: { type: String, default: "" },
    contactBannerTitle: multiLangField,
  },
  { _id: false }
);

/* 2️⃣ Form Section */
const contactFormSchema = new mongoose.Schema(
  {
    contactFormImg: { type: String, default: "" },
    contactForm: multiLangField, // intro text or description
  },
  { _id: false }
);

/* 3️⃣ Location Section */
const contactLocationSchema = new mongoose.Schema(
  {
    contactLocationTitle: multiLangField,
    contactLocationDes: multiLangField,
    contactLocationButtonText: multiLangField,
    contactLocationButtonLink: { type: String, default: "" },
  },
  { _id: false }
);

/* 4️⃣ Hours Section */
const contactHoursSchema = new mongoose.Schema(
  {
    contactHoursTitle: multiLangField,
    contactHoursList: [multiLangField], // dynamic list of hours
  },
  { _id: false }
);

/* 5️⃣ Map Section */
const contactMapSchema = new mongoose.Schema(
  {
    contactMapTitle: multiLangField,
    contactMapMap: { type: String, default: "" }, // iframe embed link
  },
  { _id: false }
);

/* 6️⃣ SEO Meta Section */
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

/* 7️⃣ Contact Team Members */
const contactTeamMemberSchema = new mongoose.Schema(
  {
    teamName: multiLangField, // member name
    teamDesgn: multiLangField, // designation
    teamEmail: { type: String, default: "" },
    teamPhone: { type: String, default: "" },
  },
  { _id: false }
);

/* 8️⃣ Contact Team Section */
const contactTeamSchema = new mongoose.Schema(
  {
    teamIntro: {
      tag: multiLangField,
      heading: multiLangField,
      description: multiLangField,
    },
    teamList: {
      type: mongoose.Schema.Types.Mixed, // stores dynamic team groups
      default: {},
    },
  },
  { _id: false }
);

/* 🧩 MAIN CONTACT PAGE SCHEMA */
const contactPageSchema = new mongoose.Schema(
  {
    contactBanner: contactBannerSchema,
    contactForm: contactFormSchema,
    contactLocation: contactLocationSchema,
    contactHours: contactHoursSchema,
    contactMap: contactMapSchema,
    contactTeam: contactTeamSchema,
    seoMeta: seoMetaSchema,
  },
  { timestamps: true }
);

// 🔄 Prevent OverwriteModelError
module.exports =
  mongoose.models.ContactPage ||
  mongoose.model("ContactPage", contactPageSchema);
