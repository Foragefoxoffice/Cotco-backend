const path = require("path");
const fs = require("fs");
const FooterPage = require("../models/FooterPage");

const saveFile = (file, folder = "footer") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getFooterPage = async (req, res) => {
  try {
    const footer = await FooterPage.findOne();
    res.json(footer || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ---------------- //
exports.updateFooterPage = async (req, res) => {
  try {
    let existing = await FooterPage.findOne();
    if (!existing) existing = new FooterPage({});

    // ------------------ LOGO ------------------ //
    if (req.files?.footerLogoFile) {
      const file = req.files.footerLogoFile;

      const maxImageSize = 2 * 1024 * 1024; // 2MB
      if (file.mimetype.startsWith("image/") && file.size > maxImageSize) {
        return res
          .status(400)
          .json({ error: "Footer logo must be less than 2MB" });
      }

      existing.footerLogo = saveFile(file, "footer");
    }

    // ------------------ SOCIAL ICON IMAGES ------------------ //
    let socials = [];
    if (req.body.footerSocials) {
      socials = JSON.parse(req.body.footerSocials);
    }

    // loop all possible iconFile_N uploaded files
    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        if (key.startsWith("iconFile_")) {
          const index = Number(key.replace("iconFile_", ""));
          const file = req.files[key];

          const savedPath = saveFile(file, "footer/socials");

          // update the JSON object with saved path
          if (socials[index]) {
            socials[index].iconImage = savedPath;
          }
        }
      });
    }

    existing.footerSocials = socials;

    // ------------------ COPYRIGHT ------------------ //
    if (req.body.copyrights !== undefined) {
      existing.copyrights = req.body.copyrights;
    }

    await existing.save();

    res.json({
      message: "Footer updated successfully",
      footer: existing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


