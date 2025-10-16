const path = require("path");
const fs = require("fs");
const AboutPage = require("../models/AboutPage");

// ✅ Safe JSON parse helper
const safeParse = (val, fallback = {}) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

// ✅ File saving helper
const saveFile = (file, folder = "about") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------------- GET ---------------------- //
exports.getAboutPage = async (req, res) => {
  try {
    const about = await AboutPage.findOne();

    // ✅ Return empty structured response if not found
    if (!about) {
      return res.json({
        aboutHero: {
          aboutTitle: { en: "", vi: "" },
          aboutBanner: "",
        },
        aboutOverview: {
          aboutOverviewImg: "",
          aboutOverviewTitle: { en: "", vi: "" },
          aboutOverviewDes: { en: "", vi: "" },
        },
        aboutFounder: {
          aboutFounderTitle: { en: "", vi: "" },
          aboutFounderName: { en: "", vi: "" },
          aboutFounderDes: [{ en: "", vi: "" }],
          founderImg1: "",
          founderImg2: "",
          founderImg3: "",
        },
        aboutMissionVission: {
          aboutMissionVissionTitle: { en: "", vi: "" },
          headingBlocks: [{ title: { en: "", vi: "" }, desc: { en: "", vi: "" } }],
        },
        aboutCore: {
          aboutCoreTitle: { en: "", vi: "" },
          aboutCoreBg1: "",
          aboutCoreTitle1: { en: "", vi: "" },
          aboutCoreDes1: { en: "", vi: "" },
          aboutCoreBg2: "",
          aboutCoreTitle2: { en: "", vi: "" },
          aboutCoreDes2: { en: "", vi: "" },
          aboutCoreBg3: "",
          aboutCoreTitle3: { en: "", vi: "" },
          aboutCoreDes3: { en: "", vi: "" },
        },
        aboutHistory: [],
        aboutTeamIntro: {
          tag: { en: "", vi: "" },
          heading: { en: "", vi: "" },
          description: { en: "", vi: "" },
        },
        aboutTeam: { dynamicTeams: {} },
        aboutAlliances: {
          aboutAlliancesTitle: { en: "", vi: "" },
          aboutAlliancesImg: [],
        },
        seoMeta: {
          metaTitle: { en: "", vi: "" },
          metaDescription: { en: "", vi: "" },
          metaKeywords: { en: "", vi: "" },
        },
      });
    }

    // ✅ Convert to plain JS object
    const aboutData = about.toObject();

    // ✅ Ensure team map converts safely (works for Map or object)
    const rawTeams = aboutData.aboutTeam?.dynamicTeams;
    if (rawTeams) {
      if (rawTeams instanceof Map) {
        aboutData.aboutTeam.dynamicTeams = Object.fromEntries(rawTeams);
      } else if (typeof rawTeams.toObject === "function") {
        aboutData.aboutTeam.dynamicTeams = rawTeams.toObject();
      } else if (typeof rawTeams === "object") {
        aboutData.aboutTeam.dynamicTeams = rawTeams;
      } else {
        aboutData.aboutTeam.dynamicTeams = {};
      }
    } else {
      aboutData.aboutTeam = { dynamicTeams: {} };
    }

    // ✅ Fallback for SEO Meta
    aboutData.seoMeta = aboutData.seoMeta || {
      metaTitle: { en: "", vi: "" },
      metaDescription: { en: "", vi: "" },
      metaKeywords: { en: "", vi: "" },
    };

    // ✅ Fallback for Team Intro
    aboutData.aboutTeamIntro = aboutData.aboutTeamIntro || {
      tag: { en: "", vi: "" },
      heading: { en: "", vi: "" },
      description: { en: "", vi: "" },
    };

    // ✅ Send final clean JSON
    return res.json(aboutData);
  } catch (err) {
    console.error("❌ getAboutPage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE ---------------------- //
exports.updateAboutPage = async (req, res) => {
  try {
    const data = req.body;
    const section = data.section || 
  (data.aboutTeam ? "aboutTeam" : 
  data.aboutHero ? "aboutHero" : 
  data.aboutOverview ? "aboutOverview" : 
  "");

    const existing = (await AboutPage.findOne()) || new AboutPage({});

    // ✅ Handle section-wise updates cleanly
    switch (section) {
      case "aboutHero": {
        const aboutHero = safeParse(data.aboutHero, existing.aboutHero || {});
        if (req.files?.aboutBannerFile) {
          aboutHero.aboutBanner = saveFile(req.files.aboutBannerFile, "about");
        } else {
          aboutHero.aboutBanner =
            aboutHero.aboutBanner || existing.aboutHero?.aboutBanner || "";
        }
        existing.aboutHero = aboutHero;
        await existing.save();
        return res.json({ message: "Hero updated", about: existing });
      }

      case "aboutOverview": {
        const aboutOverview = safeParse(
          data.aboutOverview,
          existing.aboutOverview || {}
        );
        if (req.files?.aboutOverviewFile) {
          aboutOverview.aboutOverviewImg = saveFile(
            req.files.aboutOverviewFile,
            "about"
          );
        } else {
          aboutOverview.aboutOverviewImg =
            aboutOverview.aboutOverviewImg ||
            existing.aboutOverview?.aboutOverviewImg ||
            "";
        }
        existing.aboutOverview = aboutOverview;
        await existing.save();
        return res.json({ message: "Overview updated", about: existing });
      }

      case "aboutFounder": {
        const aboutFounder = safeParse(
          data.aboutFounder,
          existing.aboutFounder || {}
        );
        ["founderImg1File", "founderImg2File", "founderImg3File"].forEach(
          (key, i) => {
            const imgKey = `founderImg${i + 1}`;
            if (req.files?.[key])
              aboutFounder[imgKey] = saveFile(req.files[key], "about");
            else
              aboutFounder[imgKey] =
                aboutFounder[imgKey] || existing.aboutFounder?.[imgKey] || "";
          }
        );
        existing.aboutFounder = aboutFounder;
        await existing.save();
        return res.json({ message: "Founder updated", about: existing });
      }

      case "aboutMissionVission": {
        const newData = safeParse(data.aboutMissionVission, {});
        const existingData = existing.aboutMissionVission || {};

        // Ensure array type
        if (!Array.isArray(newData.headingBlocks)) {
          newData.headingBlocks = existingData.headingBlocks || [];
        }

        existing.aboutMissionVission = {
          ...existingData,
          ...newData,
        };

        await existing.save();
        return res.json({
          message: "Mission & Vision updated successfully",
          about: existing,
        });
      }

      case "aboutHistory": {
  const aboutHistoryData = safeParse(
    data.aboutHistory,
    existing.aboutHistorySection?.aboutHistory || []
  );

  const aboutHistoryTitle = safeParse(
    data.aboutHistoryTitle,
    existing.aboutHistorySection?.aboutHistoryTitle || { en: "", vi: "" }
  );

  // Handle image uploads if present
  const updatedHistory = aboutHistoryData.map((item, i) => {
    const imgField = `historyImage${i}`;
    const file = req.files?.[imgField];
    if (file) {
      const savedPath = saveFile(file, "about");
      return { ...item, image: savedPath };
    }
    return {
      ...item,
      image:
        item.image ||
        existing.aboutHistorySection?.aboutHistory?.[i]?.image ||
        "",
    };
  });

  existing.aboutHistorySection = {
    aboutHistoryTitle,
    aboutHistory: updatedHistory,
  };

  await existing.save();

  return res.json({
    message: "History section updated successfully",
    about: existing,
  });
}


      case "aboutCore": {
  // ✅ Parse incoming data or fallback to existing
  const aboutCore = safeParse(data.aboutCore, existing.aboutCore || {});

  // ✅ Ensure multilingual fields exist
  aboutCore.aboutCoreTitle = {
    en:
      aboutCore.aboutCoreTitle?.en ||
      existing.aboutCore?.aboutCoreTitle?.en ||
      "",
    vi:
      aboutCore.aboutCoreTitle?.vi ||
      existing.aboutCore?.aboutCoreTitle?.vi ||
      "",
  };

  // ✅ Loop through all 3 core blocks
  [1, 2, 3].forEach((i) => {
    const fileKey = `aboutCoreBg${i}File`;
    const fieldKey = `aboutCoreBg${i}`;

    // Handle image file upload (or keep existing)
    if (req.files?.[fileKey]) {
      aboutCore[fieldKey] = saveFile(req.files[fileKey], "about");
    } else {
      aboutCore[fieldKey] =
        aboutCore[fieldKey] || existing.aboutCore?.[fieldKey] || "";
    }

    // ✅ Ensure multilingual text structure exists
    aboutCore[`aboutCoreTitle${i}`] = {
      en:
        aboutCore[`aboutCoreTitle${i}`]?.en ||
        existing.aboutCore?.[`aboutCoreTitle${i}`]?.en ||
        "",
      vi:
        aboutCore[`aboutCoreTitle${i}`]?.vi ||
        existing.aboutCore?.[`aboutCoreTitle${i}`]?.vi ||
        "",
    };

    aboutCore[`aboutCoreDes${i}`] = {
      en:
        aboutCore[`aboutCoreDes${i}`]?.en ||
        existing.aboutCore?.[`aboutCoreDes${i}`]?.en ||
        "",
      vi:
        aboutCore[`aboutCoreDes${i}`]?.vi ||
        existing.aboutCore?.[`aboutCoreDes${i}`]?.vi ||
        "",
    };
  });

  // ✅ Save merged object safely
  existing.aboutCore = aboutCore;
  await existing.save();

  return res.json({
    message: "Core Values section updated successfully",
    about: existing,
  });
}


case "aboutTeam": {
  // 🧠 Parse incoming data safely
  let aboutTeam = safeParse(
    data.aboutTeam,
    existing.aboutTeam || { dynamicTeams: {} }
  );

  const aboutTeamIntro = safeParse(
    data.aboutTeamIntro,
    existing.aboutTeamIntro || {
      tag: { en: "", vi: "" },
      heading: { en: "", vi: "" },
      description: { en: "", vi: "" },
    }
  );

  // 🔄 Normalize structure
  if (!aboutTeam.dynamicTeams) aboutTeam = { dynamicTeams: aboutTeam };

  // ✅ Convert any Maps in existing data to plain objects
  let existingTeams = {};
  if (existing.aboutTeam?.dynamicTeams instanceof Map) {
    existingTeams = Object.fromEntries(existing.aboutTeam.dynamicTeams);
  } else if (typeof existing.aboutTeam?.dynamicTeams === "object") {
    existingTeams = existing.aboutTeam.dynamicTeams;
  }

  const newTeams = aboutTeam.dynamicTeams || {};

  // ✅ Always reinitialize Map (handles missing field case)
  existing.aboutTeam = {
    dynamicTeams: new Map(Object.entries({ ...existingTeams, ...newTeams })),
  };

  // ✅ Update intro text
  existing.aboutTeamIntro = aboutTeamIntro;

  // ✅ Force Mongoose to mark it modified (important after deletion)
  existing.markModified("aboutTeam");
  existing.markModified("aboutTeam.dynamicTeams");

  await existing.save();

  return res.json({ message: "Team updated successfully", about: existing });
}

      case "aboutAlliances": {
  const aboutAlliances = safeParse(
    data.aboutAlliances,
    existing.aboutAlliances || {}
  );
  if (req.files?.aboutAlliancesFiles) {
    const files = Array.isArray(req.files.aboutAlliancesFiles)
      ? req.files.aboutAlliancesFiles
      : [req.files.aboutAlliancesFiles];
    const uploadedPaths = files.map((f) => saveFile(f, "alliances"));
    aboutAlliances.aboutAlliancesImg = [
      ...(existing.aboutAlliances?.aboutAlliancesImg || []),
      ...uploadedPaths,
    ];
  }
  existing.aboutAlliances = aboutAlliances;
  await existing.save();
  return res.json({ message: "Alliances updated", about: existing });
}


      default:
        break;
    }

    // fallback: full page update
    res.json({ message: "Unhandled section", about: existing });
  } catch (err) {
    console.error("❌ updateAboutPage error:", err);
    res.status(500).json({ error: err.message });
  }
};
