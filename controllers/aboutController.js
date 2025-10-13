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

    if (!about) {
      return res.json({
        seoMeta: {
          metaTitle: { en: "", vi: "" },
          metaDescription: { en: "", vi: "" },
          metaKeywords: { en: "", vi: "" },
        },
        aboutTeam: { dynamicTeams: {} },
      });
    }

    const aboutData = about.toObject();

    // ✅ Convert Map to object for frontend
    if (aboutData.aboutTeam?.dynamicTeams instanceof Map) {
      aboutData.aboutTeam.dynamicTeams = Object.fromEntries(
        aboutData.aboutTeam.dynamicTeams
      );
    }

    aboutData.seoMeta = aboutData.seoMeta || {
      metaTitle: { en: "", vi: "" },
      metaDescription: { en: "", vi: "" },
      metaKeywords: { en: "", vi: "" },
    };

    res.json(aboutData);
  } catch (err) {
    console.error("❌ getAboutPage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE ---------------------- //
exports.updateAboutPage = async (req, res) => {
  try {
    const data = req.body;
    const section = data.section || "";
    const existing = (await AboutPage.findOne()) || new AboutPage({});

    /* ==========================================================
       ✅ CASE 1: SEO META SECTION
    ========================================================== */
    if (section === "aboutSeoMeta" || data.aboutSeoMeta) {
      const seoMeta = safeParse(data.aboutSeoMeta, existing.seoMeta || {});
      existing.seoMeta = {
        ...existing.seoMeta?.toObject?.(),
        ...seoMeta,
      };

      await existing.save();
      return res.json({
        message: "SEO Meta updated successfully",
        about: existing,
      });
    }

    /* ==========================================================
       ✅ CASE 2: FULL PAGE UPDATE
    ========================================================== */
    const aboutHero = safeParse(data.aboutHero, existing.aboutHero || {});
    const aboutOverview = safeParse(data.aboutOverview, existing.aboutOverview || {});
    const aboutFounder = safeParse(data.aboutFounder, existing.aboutFounder || {});
    const aboutMissionVission = safeParse(data.aboutMissionVission, existing.aboutMissionVission || {});
    const aboutCore = safeParse(data.aboutCore, existing.aboutCore || {});
    let aboutHistory = safeParse(data.aboutHistory, existing.aboutHistory || []);
    const aboutAlliances = safeParse(data.aboutAlliances, existing.aboutAlliances || {});
    let aboutTeam = safeParse(data.aboutTeam, existing.aboutTeam || { dynamicTeams: {} });

    // ---------------- HERO ----------------
    if (req.files?.aboutBannerFile) {
      aboutHero.aboutBanner = saveFile(req.files.aboutBannerFile, "about");
    } else {
      aboutHero.aboutBanner =
        aboutHero.aboutBanner || existing.aboutHero?.aboutBanner || "";
    }

    // ---------------- OVERVIEW ----------------
    if (req.files?.aboutOverviewFile) {
      aboutOverview.aboutOverviewImg = saveFile(req.files.aboutOverviewFile, "about");
    } else {
      aboutOverview.aboutOverviewImg =
        aboutOverview.aboutOverviewImg || existing.aboutOverview?.aboutOverviewImg || "";
    }

    // ---------------- FOUNDER ----------------
    ["founderImg1File", "founderImg2File", "founderImg3File"].forEach((key, i) => {
      const imgKey = `founderImg${i + 1}`;
      if (req.files?.[key]) {
        aboutFounder[imgKey] = saveFile(req.files[key], "about");
      } else {
        aboutFounder[imgKey] =
          aboutFounder[imgKey] || existing.aboutFounder?.[imgKey] || "";
      }
    });

    // ---------------- CORE ----------------
    [1, 2, 3].forEach((i) => {
      const fileKey = `aboutCoreBg${i}File`;
      const fieldKey = `aboutCoreBg${i}`;
      if (req.files?.[fileKey]) {
        aboutCore[fieldKey] = saveFile(req.files[fileKey], "about");
      } else {
        aboutCore[fieldKey] =
          aboutCore[fieldKey] || existing.aboutCore?.[fieldKey] || "";
      }
    });

    // ---------------- HISTORY ----------------
    if (!Array.isArray(aboutHistory)) aboutHistory = [];
    aboutHistory = aboutHistory.map((item, i) => {
      let image = "";
      const fileKey = `historyImage${i}`;
      if (req.files?.[fileKey]) {
        image = saveFile(req.files[fileKey], "history");
      } else if (item.image && item.image.startsWith("/uploads/")) {
        image = item.image;
      } else if (existing.aboutHistory?.[i]?.image) {
        image = existing.aboutHistory[i].image;
      }

      return {
        year: item.year || "",
        content: item.content || { en: "", vi: "" },
        image,
      };
    });

    // ---------------- TEAM (Dynamic) ----------------
    if (!aboutTeam.dynamicTeams) {
      // ✅ Convert old flat object to new dynamic structure
      aboutTeam = { dynamicTeams: aboutTeam };
    }

    const existingTeams = existing.aboutTeam?.dynamicTeams?.toObject?.() || {};
    const newTeams = aboutTeam.dynamicTeams || {};

    existing.aboutTeam = {
      dynamicTeams: {
        ...existingTeams,
        ...newTeams,
      },
    };

    // ---------------- ALLIANCES ----------------
    if (req.files?.aboutAlliancesFiles) {
      const files = Array.isArray(req.files.aboutAlliancesFiles)
        ? req.files.aboutAlliancesFiles
        : [req.files.aboutAlliancesFiles];
      const uploadedPaths = files.map((f) => saveFile(f, "alliances"));
      aboutAlliances.aboutAlliancesImg = [
        ...(existing.aboutAlliances?.aboutAlliancesImg || []),
        ...uploadedPaths,
      ];
    } else {
      aboutAlliances.aboutAlliancesImg =
        aboutAlliances.aboutAlliancesImg?.length
          ? aboutAlliances.aboutAlliancesImg
          : existing.aboutAlliances?.aboutAlliancesImg || [];
    }

    // ✅ Assign back to doc
    existing.aboutHero = aboutHero;
    existing.aboutOverview = aboutOverview;
    existing.aboutFounder = aboutFounder;
    existing.aboutMissionVission = aboutMissionVission;
    existing.aboutCore = aboutCore;
    existing.aboutHistory = aboutHistory;
    existing.aboutAlliances = aboutAlliances;

    await existing.save();

    res.json({ message: "About Page updated successfully", about: existing });
  } catch (err) {
    console.error("❌ updateAboutPage error:", err);
    res.status(500).json({ error: err.message });
  }
};
