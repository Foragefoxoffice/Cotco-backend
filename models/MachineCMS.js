const mongoose = require("mongoose");

const MachineCMSSchema = new mongoose.Schema(
  {
    heroSection: {
      heroVideo: { type: String, default: "" },
      heroTitle: {
        en: { type: String, default: "" },
        vi: { type: String, default: "" },
      },
    },
    introSection: {
      introDescription: {
        en: { type: String, default: "" },
        vi: { type: String, default: "" },
      },
    },
    benefitsSection: {
      benefitTitle: {
        en: { type: String, default: "" },
        vi: { type: String, default: "" },
      },
      benefitImage: { type: String, default: "" },
      benefitBullets: {
        en: { type: [String], default: [""] },
        vi: { type: [String], default: [""] },
      },
    },
    machineTeamSection: {
  aboutTeamIntro: {
    tag: { en: String, vi: String },
    heading: { en: String, vi: String },
    description: { en: String, vi: String },
  },
  aboutTeam: {
    type: Object, // each key = team group
    default: {},
  },
},
seoMeta: {
  metaTitle: { en: String, vi: String },
  metaDescription: { en: String, vi: String },
  metaKeywords: { en: String, vi: String },
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("MachineCMS", MachineCMSSchema, "machinecms");
