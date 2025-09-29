const mongoose = require("mongoose");

// Reusable multilingual field
const multiLangField = {
  en: { type: String, default: "" },
  vi: { type: String, default: "" },
};

// 1. Hero
const aboutHeroSchema = new mongoose.Schema(
  {
    aboutTitle: multiLangField,
    aboutBanner: { type: String },
  },
  { _id: false }
);

// 2. Overview
const aboutOverviewSchema = new mongoose.Schema(
  {
    aboutOverviewImg: { type: String },
    aboutOverviewTitle: multiLangField,
    aboutOverviewDes: multiLangField,
  },
  { _id: false }
);

// 3. Founder
const aboutFounderSchema = new mongoose.Schema(
  {
    aboutFounderTitle: multiLangField,
    aboutFounderName: multiLangField,
    aboutFounderDes: multiLangField,
    founderImg1: { type: String, default: "" },
    founderImg2: { type: String, default: "" },
    founderImg3: { type: String, default: "" },
  },
  { _id: false }
);

// 4. Mission & Vision
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

// 5. Core Values
const aboutCoreSchema = new mongoose.Schema(
  {
    aboutCoreBg1: { type: String },
    aboutCoreTitle1: multiLangField,
    aboutCoreDes1: multiLangField,

    aboutCoreBg2: { type: String },
    aboutCoreTitle2: multiLangField,
    aboutCoreDes2: multiLangField,

    aboutCoreBg3: { type: String },
    aboutCoreTitle3: multiLangField,
    aboutCoreDes3: multiLangField,
  },
  { _id: false }
);

// 6. History
const aboutHistorySchema = new mongoose.Schema(
  {
    year: { type: String },
    content: multiLangField,
    image: { type: String },
  },
  { _id: false }
);

// 7. Teams
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
    cottonTeam: [teamMemberSchema],
    machineTeam: [teamMemberSchema],
    fiberTeam: [teamMemberSchema],
    marketingTeam: [teamMemberSchema],
    directorTeam: [teamMemberSchema],
  },
  { _id: false }
);

// 8. Alliances
const aboutAlliancesSchema = new mongoose.Schema(
  {
    aboutAlliancesImg: [{ type: String }],
  },
  { _id: false }
);

// ✅ Main Schema
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
  },
  { timestamps: true }
);

// 🔄 Prevent OverwriteModelError
module.exports =
  mongoose.models.AboutPage || mongoose.model("AboutPage", aboutPageSchema);
