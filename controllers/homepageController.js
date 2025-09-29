// controllers/homepageController.js
const path = require("path");
const fs = require("fs");
const Homepage = require("../models/Homepage");

// Helper to save uploaded file
const saveFile = (file, folder = "homepage") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// Get Homepage
exports.getHomepage = async (req, res) => {
  try {
    const homepage = await Homepage.findOne();
    res.json(homepage || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Homepage
exports.updateHomepage = async (req, res) => {
  try {
    let data = req.body;

    let heroSection = JSON.parse(data.heroSection || "{}");
    let whoWeAreSection = JSON.parse(data.whoWeAreSection || "{}");
    let whatWeDoSection = JSON.parse(data.whatWeDoSection || "{}");
    let companyLogosSection = JSON.parse(data.companyLogosSection || "{}");
    let definedUsSection = JSON.parse(data.definedUsSection || "{}");
    let coreValuesSection = JSON.parse(data.coreValuesSection || "{}");

    // Hero
    if (req.files?.bgFile) {
      const savedPath = saveFile(req.files.bgFile, "homepage");
      heroSection.bgUrl = savedPath;
      heroSection.bgType = /\.(mp4|webm|mov|avi)$/i.test(savedPath)
        ? "video"
        : "image";
    }

    // Who We Are
    if (req.files?.whoWeAreFile) {
      whoWeAreSection.whoWeArebannerImage = saveFile(
        req.files.whoWeAreFile,
        "homepage"
      );
    }

    // What We Do
    [
      "Icon1File",
      "Icon2File",
      "Icon3File",
      "Img1File",
      "Img2File",
      "Img3File",
    ].forEach((field) => {
      const key = field.replace("File", ""); // e.g. whatWeDoIcon1
      if (req.files?.[`whatWeDo${field}`]) {
        whatWeDoSection[`whatWeDo${key}`] = saveFile(
          req.files[`whatWeDo${field}`],
          "homepage"
        );
      }
    });

    // ✅ Partners (Infinite Logos) - safer update
    if (Array.isArray(companyLogosSection.logos)) {
      companyLogosSection.logos = companyLogosSection.logos.map((logo, i) => {
        const fileKey = `partnerLogo${i}`;
        if (req.files?.[fileKey]) {
          // if a new file was uploaded → overwrite
          return { url: saveFile(req.files[fileKey], "partners") };
        }
        // ✅ keep the old url from DB if it exists
        if (logo.url) {
          return { url: logo.url };
        }
        return { url: "" }; // fallback
      });
    }

    // Defined Us
    [1, 2, 3, 4, 5, 6].forEach((i) => {
      if (req.files?.[`definedUsLogo${i}File`]) {
        definedUsSection[`definedUsLogo${i}`] = saveFile(
          req.files[`definedUsLogo${i}File`],
          "homepage"
        );
      }
    });

    // Core Values
    if (req.files?.coreImageFile) {
      coreValuesSection.coreImage = saveFile(
        req.files.coreImageFile,
        "homepage"
      );
    }

    // Save/Update Homepage
    let homepage = await Homepage.findOne();
    if (!homepage) {
      homepage = new Homepage({});
    }

    if (Object.keys(heroSection).length) {
      homepage.heroSection = {
        ...homepage.heroSection?.toObject(),
        ...heroSection,
      };
    }
    if (Object.keys(whoWeAreSection).length) {
      homepage.whoWeAreSection = {
        ...homepage.whoWeAreSection?.toObject(),
        ...whoWeAreSection,
      };
    }
    if (Object.keys(whatWeDoSection).length) {
      homepage.whatWeDoSection = {
        ...homepage.whatWeDoSection?.toObject(),
        ...whatWeDoSection,
      };
    }
    if (Object.keys(companyLogosSection).length) {
      homepage.companyLogosSection = {
        ...homepage.companyLogosSection?.toObject(),
        ...companyLogosSection,
      };
    }
    if (Object.keys(definedUsSection).length) {
      homepage.definedUsSection = {
        ...homepage.definedUsSection?.toObject(),
        ...definedUsSection,
      };
    }
    if (Object.keys(coreValuesSection).length) {
      homepage.coreValuesSection = {
        ...homepage.coreValuesSection?.toObject(),
        ...coreValuesSection,
      };
    }

    await homepage.save();
    res.json({ message: "Homepage updated successfully", homepage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
