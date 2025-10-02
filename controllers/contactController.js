const path = require("path");
const fs = require("fs");
const ContactPage = require("../models/ContactPage");

// Safe JSON parser
const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

// File save helper
const saveFile = (file, folder = "contact") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getContactPage = async (req, res) => {
  try {
    const contact = await ContactPage.findOne();
    res.json(contact || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ---------------- //
exports.updateContactPage = async (req, res) => {
  try {
    let data = req.body;

    let existing = await ContactPage.findOne();
    if (!existing) existing = new ContactPage({});

    // Safe parse
    let contactBanner = safeParse(data.contactBanner, existing.contactBanner || {});
    let contactForm = safeParse(data.contactForm, existing.contactForm || {});
    let contactLocation = safeParse(data.contactLocation, existing.contactLocation || {});
    let contactHours = safeParse(data.contactHours, existing.contactHours || {});
    let contactMap = safeParse(data.contactMap, existing.contactMap || {});

    // Banner image
    if (req.files?.contactBannerBgFile) {
      contactBanner.contactBannerBg = saveFile(req.files.contactBannerBgFile, "contact");
    } else {
      contactBanner.contactBannerBg =
        contactBanner.contactBannerBg || existing?.contactBanner?.contactBannerBg || "";
    }

    // Form image
    if (req.files?.contactFormImgFile) {
      contactForm.contactFormImg = saveFile(req.files.contactFormImgFile, "contact");
    } else {
      contactForm.contactFormImg =
        contactForm.contactFormImg || existing?.contactForm?.contactFormImg || "";
    }

    // Assign back
    existing.contactBanner = contactBanner;
    existing.contactForm = contactForm;
    existing.contactLocation = contactLocation;
    existing.contactHours = contactHours;
    existing.contactMap = contactMap;

    await existing.save();

    res.json({ message: "Contact Page updated successfully", contact: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
