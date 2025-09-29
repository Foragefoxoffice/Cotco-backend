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

    if (req.files?.bgFile) {
      heroSection.bgUrl = saveFile(req.files.bgFile, "homepage");
    }

    if (req.files?.whoWeAreFile) {
      whoWeAreSection.whoWeArebannerImage = saveFile(
        req.files.whoWeAreFile,
        "homepage"
      );
    }

    [
      "whatWeDoIcon1",
      "whatWeDoIcon2",
      "whatWeDoIcon3",
      "whatWeDoImg1",
      "whatWeDoImg2",
      "whatWeDoImg3",
    ].forEach((field) => {
      if (req.files?.[field])
        whatWeDoSection[field] = saveFile(req.files[field], "homepage");
    });

    [
      "companyLogo1",
      "companyLogo2",
      "companyLogo3",
      "companyLogo4",
      "companyLogo5",
      "companyLogo6",
    ].forEach((field) => {
      if (req.files?.[field])
        companyLogosSection[field] = saveFile(req.files[field], "homepage");
    });

    [
      "definedUsLogo1",
      "definedUsLogo2",
      "definedUsLogo3",
      "definedUsLogo4",
      "definedUsLogo5",
      "definedUsLogo6",
    ].forEach((field) => {
      if (req.files?.[field])
        definedUsSection[field] = saveFile(req.files[field], "homepage");
    });

    // ✅ Core Values image
    if (req.files?.coreImage) {
      coreValuesSection.coreImage = saveFile(req.files.coreImage, "homepage");
    }

    let homepage = await Homepage.findOne();
    if (!homepage) {
      homepage = new Homepage({
        heroSection,
        whoWeAreSection,
        whatWeDoSection,
        companyLogosSection,
        definedUsSection,
        coreValuesSection,
      });
    } else {
      homepage.heroSection = heroSection;
      homepage.whoWeAreSection = whoWeAreSection;
      homepage.whatWeDoSection = whatWeDoSection;
      homepage.companyLogosSection = companyLogosSection;
      homepage.definedUsSection = definedUsSection;
      homepage.coreValuesSection = coreValuesSection;
    }

    await homepage.save();
    res.json({ message: "Homepage updated successfully", homepage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
