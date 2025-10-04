const path = require("path");
const fs = require("fs");
const TermsConditionsPage = require("../models/TermsConditionsPage");

const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

// File save helper
const saveFile = (file, folder = "terms") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getTermsPage = async (req, res) => {
  try {
    const terms = await TermsConditionsPage.findOne();
    res.json(terms || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ---------------- //
exports.updateTermsPage = async (req, res) => {
  try {
    let data = req.body;
    let existing = await TermsConditionsPage.findOne();
    if (!existing) existing = new TermsConditionsPage({});

    // Handle termsBanner
    let termsBanner = safeParse(data.termsBanner, existing.termsBanner || {});

    // ❌ remove React-only property
    if ("termsBannerMediaFile" in termsBanner) {
      delete termsBanner.termsBannerMediaFile;
    }

    if (req.files?.termsBannerMediaFile) {
      termsBanner.termsBannerMedia = saveFile(
        req.files.termsBannerMediaFile,
        "terms"
      );
    } else {
      termsBanner.termsBannerMedia =
        termsBanner.termsBannerMedia ||
        existing?.termsBanner?.termsBannerMedia ||
        "";
    }

    existing.termsBanner = {
      termsBannerMedia: termsBanner.termsBannerMedia,
      termsBannerTitle: termsBanner.termsBannerTitle || { en: "", vi: "" },
    };

    // Handle long content
    existing.termsConditionsContent = safeParse(
      data.termsConditionsContent,
      existing.termsConditionsContent || { en: "", vi: "" }
    );

    await existing.save();
    res.json({
      message: "Terms & Conditions updated successfully",
      terms: existing,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

