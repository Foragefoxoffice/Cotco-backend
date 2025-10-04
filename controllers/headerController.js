const path = require("path");
const fs = require("fs");
const HeaderPage = require("../models/HeaderPage");

const saveFile = (file, folder = "header") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);

  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getHeaderPage = async (req, res) => {
  try {
    const header = await HeaderPage.findOne();
    res.json(header || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ---------------- //
exports.updateHeaderPage = async (req, res) => {
  try {
    let existing = await HeaderPage.findOne();
    if (!existing) existing = new HeaderPage({});

    // ✅ Handle logo with 2MB validation
    if (req.files?.headerLogoFile) {
      const file = req.files.headerLogoFile;

      const maxImageSize = 2 * 1024 * 1024; // 2MB
      if (file.mimetype.startsWith("image/") && file.size > maxImageSize) {
        return res
          .status(400)
          .json({ error: "Logo image must be less than 2MB" });
      }

      existing.headerLogo = saveFile(file, "header");
    } else {
      existing.headerLogo = existing.headerLogo || "";
    }

    await existing.save();
    res.json({ message: "Header updated successfully", header: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
