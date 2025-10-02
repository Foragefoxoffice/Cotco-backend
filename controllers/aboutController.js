// controllers/aboutController.js
const path = require("path");
const fs = require("fs");
const AboutPage = require("../models/AboutPage");

// ✅ Safe JSON parse helper
const safeParse = (val, fallback) => {
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
    res.json(about || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE ---------------------- //
exports.updateAboutPage = async (req, res) => {
  try {
    let data = req.body;

    // ✅ Find or create doc
    let existing = await AboutPage.findOne();
    if (!existing) existing = new AboutPage({});

    // ✅ Safe parsing with fallback to existing
    let aboutHero = safeParse(data.aboutHero, existing.aboutHero || {});
    let aboutOverview = safeParse(
      data.aboutOverview,
      existing.aboutOverview || {}
    );
    let aboutFounder = safeParse(
      data.aboutFounder,
      existing.aboutFounder || {}
    );
    let aboutMissionVission = safeParse(
      data.aboutMissionVission,
      existing.aboutMissionVission || {}
    );
    let aboutCore = safeParse(data.aboutCore, existing.aboutCore || {});
    let aboutHistory = safeParse(
      data.aboutHistory,
      existing.aboutHistory || []
    );
    let aboutTeam = safeParse(data.aboutTeam, existing.aboutTeam || {});
    let aboutAlliances = safeParse(
      data.aboutAlliances,
      existing.aboutAlliances || {}
    );

    // ---------------- HERO ----------------
    if (req.files?.aboutBannerFile) {
      aboutHero.aboutBanner = saveFile(req.files.aboutBannerFile, "about");
    } else {
      aboutHero.aboutBanner =
        aboutHero.aboutBanner || existing?.aboutHero?.aboutBanner || "";
    }

    // ---------------- OVERVIEW ----------------
    if (req.files?.aboutOverviewFile) {
      aboutOverview.aboutOverviewImg = saveFile(
        req.files.aboutOverviewFile,
        "about"
      );
    } else {
      aboutOverview.aboutOverviewImg =
        aboutOverview.aboutOverviewImg ||
        existing?.aboutOverview?.aboutOverviewImg ||
        "";
    }

    // ---------------- FOUNDER ----------------
    if (req.files?.founderImg1File) {
      aboutFounder.founderImg1 = saveFile(req.files.founderImg1File, "about");
    } else {
      aboutFounder.founderImg1 =
        aboutFounder.founderImg1 || existing?.aboutFounder?.founderImg1 || "";
    }

    if (req.files?.founderImg2File) {
      aboutFounder.founderImg2 = saveFile(req.files.founderImg2File, "about");
    } else {
      aboutFounder.founderImg2 =
        aboutFounder.founderImg2 || existing?.aboutFounder?.founderImg2 || "";
    }

    if (req.files?.founderImg3File) {
      aboutFounder.founderImg3 = saveFile(req.files.founderImg3File, "about");
    } else {
      aboutFounder.founderImg3 =
        aboutFounder.founderImg3 || existing?.aboutFounder?.founderImg3 || "";
    }

    // ---------------- CORE ----------------
    [1, 2, 3].forEach((i) => {
      if (req.files?.[`aboutCoreBg${i}File`]) {
        aboutCore[`aboutCoreBg${i}`] = saveFile(
          req.files[`aboutCoreBg${i}File`],
          "about"
        );
      } else {
        aboutCore[`aboutCoreBg${i}`] =
          aboutCore[`aboutCoreBg${i}`] ||
          existing?.aboutCore?.[`aboutCoreBg${i}`] ||
          "";
      }
    });

    // ---------------- HISTORY ----------------
    if (!Array.isArray(aboutHistory)) {
      aboutHistory = [];
    }

    aboutHistory = aboutHistory.map((item, i) => {
      let image = "";

      // ✅ match frontend naming: historyImage0, historyImage1 ...
      if (req.files?.[`historyImage${i}`]) {
        image = saveFile(req.files[`historyImage${i}`], "history");
      } else if (item.image && item.image.startsWith("/uploads/")) {
        image = item.image; // keep path if valid
      } else if (existing?.aboutHistory?.[i]?.image) {
        image = existing.aboutHistory[i].image; // fallback
      }

      return {
        year: item.year || "",
        content: item.content || { en: "", vi: "" },
        image,
      };
    });

    existing.aboutHistory = aboutHistory;


    // ---------------- TEAM ----------------
    // overwrite with safeParse result

    // ---------------- ALLIANCES ----------------
    if (req.files?.aboutAlliancesFiles) {
      const files = Array.isArray(req.files.aboutAlliancesFiles)
        ? req.files.aboutAlliancesFiles
        : [req.files.aboutAlliancesFiles];
      const uploadedPaths = files.map((f) => saveFile(f, "alliances"));

      aboutAlliances.aboutAlliancesImg = [
        ...(existing?.aboutAlliances?.aboutAlliancesImg || []),
        ...uploadedPaths,
      ];
    } else {
      aboutAlliances.aboutAlliancesImg = aboutAlliances.aboutAlliancesImg
        ?.length
        ? aboutAlliances.aboutAlliancesImg
        : existing?.aboutAlliances?.aboutAlliancesImg || [];
    }

    // ✅ Assign back to doc
    existing.aboutHero = aboutHero;
    existing.aboutOverview = aboutOverview;
    existing.aboutFounder = aboutFounder;
    existing.aboutMissionVission = aboutMissionVission;
    existing.aboutCore = aboutCore;
    existing.aboutHistory = aboutHistory; // <- full updated array
    existing.aboutTeam = aboutTeam;
    existing.aboutAlliances = aboutAlliances;

    await existing.save();

    res.json({ message: "About Page updated successfully", about: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
