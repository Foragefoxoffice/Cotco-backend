const mongoose = require("mongoose");

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* 1. Banner */
const contactBannerSchema = new mongoose.Schema(
  {
    contactBannerBg: { type: String, default: "" },
    contactBannerTitle: multiLangField,
  },
  { _id: false }
);

/* 2. Form */
const contactFormSchema = new mongoose.Schema(
  {
    contactFormImg: { type: String, default: "" },
    contactForm: multiLangField, // description or form intro text
  },
  { _id: false }
);

/* 3. Location */
const contactLocationSchema = new mongoose.Schema(
  {
    contactLocationTitle: multiLangField,
    contactLocationDes: multiLangField,
    contactLocationButtonText: multiLangField,
    contactLocationButtonLink: { type: String, default: "" },
  },
  { _id: false }
);

/* 4. Hours */
const contactHoursSchema = new mongoose.Schema(
  {
    contactHoursTitle: multiLangField,
    contactHoursList: [multiLangField], // infinity list
  },
  { _id: false }
);

/* 5. Map */
const contactMapSchema = new mongoose.Schema(
  {
    contactMapTitle: multiLangField,
    contactMapMap: { type: String, default: "" }, // iframe embed link
  },
  { _id: false }
);

/* Main Page */
const contactPageSchema = new mongoose.Schema(
  {
    contactBanner: contactBannerSchema,
    contactForm: contactFormSchema,
    contactLocation: contactLocationSchema,
    contactHours: contactHoursSchema,
    contactMap: contactMapSchema,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ContactPage ||
  mongoose.model("ContactPage", contactPageSchema);
