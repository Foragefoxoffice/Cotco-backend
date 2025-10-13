const mongoose = require("mongoose");

// ✅ Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// 1️⃣ HERO SECTION
const aboutHeroSchema = new mongoose.Schema(
  {
    aboutTitle: multiLangField,
    aboutBanner: { type: String, default: "" },
  },
  { _id: false }
);

// 2️⃣ OVERVIEW
const aboutOverviewSchema = new mongoose.Schema(
  {
    aboutOverviewImg: { type: String, default: "" },
    aboutOverviewTitle: multiLangField,
    aboutOverviewDes: multiLangField,
  },
  { _id: false }
);

// 3️⃣ FOUNDER SECTION
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

// 4️⃣ MISSION & VISION
const aboutMissionVissionSchema = new mongoose.Schema(
  {
    aboutMissionVissionTitle: multiLangField,

    aboutMissionVissionSubhead1: multiLangField,
    aboutMissionVissionDes1: multiLangField,
    aboutMissionVissionSubhead2: multiLangField,
    aboutMissionVissionDes2: multiLangField,
    aboutMissionVissionSubhead3: multiLangField,
    aboutMissionVissionDes3: multiLangField,

    aboutMissionVissionBoxCount1: { type: Number, default: 0 },
    aboutMissionBoxDes1: multiLangField,
    aboutMissionVissionBoxCount2: { type: Number, default: 0 },
    aboutMissionBoxDes2: multiLangField,
    aboutMissionVissionBoxCount3: { type: Number, default: 0 },
    aboutMissionBoxDes3: multiLangField,
  },
  { _id: false }
);

// 5️⃣ CORE VALUES
const aboutCoreSchema = new mongoose.Schema(
  {
    aboutCoreBg1: { type: String, default: "" },
    aboutCoreTitle1: multiLangField,
    aboutCoreDes1: multiLangField,

    aboutCoreBg2: { type: String, default: "" },
    aboutCoreTitle2: multiLangField,
    aboutCoreDes2: multiLangField,

    aboutCoreBg3: { type: String, default: "" },
    aboutCoreTitle3: multiLangField,
    aboutCoreDes3: multiLangField,
  },
  { _id: false }
);

// 6️⃣ HISTORY
const aboutHistorySchema = new mongoose.Schema(
  {
    year: { type: String, default: "" },
    content: multiLangField,
    image: { type: String, default: "" },
  },
  { _id: false }
);

// 7️⃣ TEAMS (Dynamic, bilingual)
const teamMemberSchema = new mongoose.Schema(
  {
    teamName: multiLangField,
    teamDesgn: multiLangField,
    teamEmail: { type: String, default: "" },
  },
  { _id: false }
);

const aboutTeamSchema = new mongoose.Schema(
  {
    dynamicTeams: {
      type: Map,
      of: new mongoose.Schema(
        {
          teamLabel: multiLangField, // bilingual team name
          members: [teamMemberSchema],
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { _id: false }
);

// 8️⃣ ALLIANCES
const aboutAlliancesSchema = new mongoose.Schema(
  {
    aboutAlliancesImg: [{ type: String, default: "" }],
  },
  { _id: false }
);

// 9️⃣ SEO META
const seoMetaSchema = new mongoose.Schema(
  {
    metaTitle: multiLangField,
    metaDescription: multiLangField,
    metaKeywords: multiLangField,
  },
  { _id: false }
);

// 🔹 MAIN ABOUT PAGE SCHEMA
const aboutPageSchema = new mongoose.Schema(
  {
    aboutHero: aboutHeroSchema,
    aboutOverview: aboutOverviewSchema,
    aboutFounder: aboutFounderSchema,
    aboutMissionVission: aboutMissionVissionSchema,
    aboutCore: aboutCoreSchema,
    aboutHistory: [aboutHistorySchema],
    aboutTeam: aboutTeamSchema,
    aboutAlliances: aboutAlliancesSchema,
    seoMeta: seoMetaSchema,
  },
  { timestamps: true }
);

// 🧩 Prevent OverwriteModelError
module.exports =
  mongoose.models.AboutPage || mongoose.model("AboutPage", aboutPageSchema);
