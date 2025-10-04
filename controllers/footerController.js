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

    // ✅ Handle Logo
    if (req.files?.footerLogoFile) {
      const file = req.files.footerLogoFile;

      const maxImageSize = 2 * 1024 * 1024; // 2MB
      if (file.mimetype.startsWith("image/") && file.size > maxImageSize) {
        return res
          .status(400)
          .json({ error: "Footer logo must be less than 2MB" });
      }

      existing.footerLogo = saveFile(file, "footer");
    } else {
      existing.footerLogo = existing.footerLogo || "";
    }

    // ✅ Handle Socials
    if (req.body.footerSocials) {
      existing.footerSocials = JSON.parse(req.body.footerSocials);
    }

    await existing.save();
    res.json({ message: "Footer updated successfully", footer: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
