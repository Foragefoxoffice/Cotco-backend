const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

/* ======================================================
   1️⃣ HERO SECTION
====================================================== */
const aboutHeroSchema = new mongoose.Schema(
  {
    aboutTitle: multiLangField,
    aboutBanner: { type: String, default: "" },
  },
  { _id: false }
);

/* ======================================================
   2️⃣ OVERVIEW
====================================================== */
const aboutOverviewSchema = new mongoose.Schema(
  {
    aboutOverviewImg: { type: String, default: "" },
    aboutOverviewTitle: multiLangField,
    aboutOverviewDes: multiLangField,
  },
  { _id: false }
);

/* ======================================================
   3️⃣ FOUNDER SECTION
====================================================== */
const aboutFounderSchema = new mongoose.Schema(
  {
    aboutFounderTitle: multiLangField,
    aboutFounderName: multiLangField,
    aboutFounderDes: [multiLangField],
    founderImg1: { type: String, default: "" },
    founderImg2: { type: String, default: "" },
    founderImg3: { type: String, default: "" },
  },
  { _id: false }
);

/* ======================================================
   4️⃣ MISSION & VISION
====================================================== */
const aboutMissionVissionSchema = new mongoose.Schema(
  {
    aboutMissionVissionTitle: multiLangField,
    headingBlocks: [
      new mongoose.Schema(
        {
          title: multiLangField,
          desc: multiLangField,
        },
        { _id: false }
      ),
    ],
    aboutMissionVissionBoxCount1: { type: Number, default: 0 },
    aboutMissionBoxDes1: multiLangField,
    aboutMissionVissionBoxCount2: { type: Number, default: 0 },
    aboutMissionBoxDes2: multiLangField,
    aboutMissionVissionBoxCount3: { type: Number, default: 0 },
    aboutMissionBoxDes3: multiLangField,
    aboutMissionVissionBoxCount4: { type: Number, default: 0 },
    aboutMissionBoxDes4: multiLangField,
  },
  { _id: false }
);

/* ======================================================
   5️⃣ CORE VALUES
====================================================== */
const aboutCoreSchema = new mongoose.Schema(
  {
    aboutCoreTitle: { en: { type: String, default: "" }, vi: { type: String, default: "" } }, // ✅ NEW main title

    aboutCoreBg1: { type: String, default: "" },
    aboutCoreTitle1: { en: { type: String, default: "" }, vi: { type: String, default: "" } },
    aboutCoreDes1: { en: { type: String, default: "" }, vi: { type: String, default: "" } },

    aboutCoreBg2: { type: String, default: "" },
    aboutCoreTitle2: { en: { type: String, default: "" }, vi: { type: String, default: "" } },
    aboutCoreDes2: { en: { type: String, default: "" }, vi: { type: String, default: "" } },

    aboutCoreBg3: { type: String, default: "" },
    aboutCoreTitle3: { en: { type: String, default: "" }, vi: { type: String, default: "" } },
    aboutCoreDes3: { en: { type: String, default: "" }, vi: { type: String, default: "" } },
  },
  { _id: false }
);


/* ======================================================
   6️⃣ HISTORY
====================================================== */
const aboutHistorySchema = new mongoose.Schema(
  {
    year: { type: String, default: "" },
    content: multiLangField,
    image: { type: String, default: "" },
  },
  { _id: false }
);

const aboutHistorySectionSchema = new mongoose.Schema(
  {
    aboutHistoryTitle: multiLangField,
    aboutHistory: [aboutHistorySchema],
  },
  { _id: false }
);

/* ======================================================
   7️⃣ TEAM SECTION (Dynamic Teams)
====================================================== */
const teamMemberSchema = new mongoose.Schema(
  {
    teamName: multiLangField,
    teamDesgn: multiLangField,
    teamEmail: { type: String, default: "" },
    teamPhone: { type: String, default: "" },
  },
  { _id: false }
);

const aboutTeamSchema = new mongoose.Schema(
  {
    dynamicTeams: {
      type: Map,
      of: new mongoose.Schema(
        {
          teamLabel: multiLangField,
          members: [teamMemberSchema],
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { _id: false }
);

/* ======================================================
   7️⃣.5️⃣ TEAM INTRO SECTION (Top 3 Fields)
====================================================== */
const aboutTeamIntroSchema = new mongoose.Schema(
  {
    tag: multiLangField, // e.g., "Our People"
    heading: multiLangField, // e.g., "Meet Our Team"
    description: multiLangField, // e.g., paragraph
  },
  { _id: false }
);

/* ======================================================
   8️⃣ ALLIANCES
====================================================== */
const aboutAlliancesSchema = new mongoose.Schema(
  {
    aboutAlliancesTitle: {
      en: { type: String, default: "" },
      vi: { type: String, default: "" },
    },
    aboutAlliancesImg: [{ type: String, default: "" }],
  },
  { _id: false }
);



/* ======================================================
   9️⃣ SEO META
====================================================== */
const seoMetaSchema = new mongoose.Schema(
  {
    metaTitle: multiLangField,
    metaDescription: multiLangField,
    metaKeywords: multiLangField,
  },
  { _id: false }
);

/* ======================================================
   🔹 MAIN ABOUT PAGE SCHEMA
====================================================== */
const aboutPageSchema = new mongoose.Schema(
  {
    aboutHero: aboutHeroSchema,
    aboutOverview: aboutOverviewSchema,
    aboutFounder: aboutFounderSchema,
    aboutMissionVission: aboutMissionVissionSchema,
    aboutCore: aboutCoreSchema,
    aboutHistory: [aboutHistorySchema],
    aboutHistorySection: aboutHistorySectionSchema,
    aboutTeamIntro: aboutTeamIntroSchema, // ✅ New Section
    aboutTeam: aboutTeamSchema,
    aboutAlliances: aboutAlliancesSchema,
    seoMeta: seoMetaSchema,
  },
  { timestamps: true }
);

/* ======================================================
   🧩 EXPORT MODEL SAFELY
====================================================== */
module.exports =
  mongoose.models.AboutPage || mongoose.model("AboutPage", aboutPageSchema);
