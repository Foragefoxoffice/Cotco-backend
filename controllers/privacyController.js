const path = require("path");
const fs = require("fs");
const PrivacyPage = require("../models/PrivacyPage");

const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

// Save uploaded file
const saveFile = (file, folder = "privacy") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getPrivacyPage = async (req, res) => {
  try {
    const privacy = await PrivacyPage.findOne();
    res.json(privacy || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ---------------- //
exports.updatePrivacyPage = async (req, res) => {
  try {
    let data = req.body;
    let existing = await PrivacyPage.findOne();
    if (!existing) existing = new PrivacyPage({});

    // ✅ Handle Banner
    let privacyBanner = safeParse(
      data.privacyBanner,
      existing.privacyBanner || {}
    );
    if (req.files?.privacyBannerMediaFile) {
      privacyBanner.privacyBannerMedia = saveFile(
        req.files.privacyBannerMediaFile,
        "privacy"
      );
    } else {
      privacyBanner.privacyBannerMedia =
        privacyBanner.privacyBannerMedia ||
        existing?.privacyBanner?.privacyBannerMedia ||
        "";
    }

    existing.privacyBanner = privacyBanner;

    // ✅ Handle Policies (Array)
    existing.privacyPolicies = safeParse(
      data.privacyPolicies,
      existing.privacyPolicies || []
    );

    await existing.save();
    res.json({
      message: "Privacy Page updated successfully",
      privacy: existing,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
