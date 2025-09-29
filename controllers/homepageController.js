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

  // detect file type automatically
  if (/\.(mp4|webm|mov|avi)$/i.test(savedPath)) {
    heroSection.bgType = "video";
  } else {
    heroSection.bgType = "image";
  }
}

// Who We Are
if (req.files?.whoWeAreFile) {
  whoWeAreSection.whoWeArebannerImage = saveFile(req.files.whoWeAreFile, "homepage");
}

// What We Do
["Icon1File","Icon2File","Icon3File","Img1File","Img2File","Img3File"].forEach((field, idx) => {
  const key = field.replace("File", ""); // → whatWeDoIcon1, whatWeDoImg1, etc.
  if (req.files?.[`whatWeDo${field}`]) {
    whatWeDoSection[`whatWeDo${key}`] = saveFile(req.files[`whatWeDo${field}`], "homepage");
  }
});

// Company Logos
[1,2,3,4,5,6].forEach((i) => {
  if (req.files?.[`companyLogo${i}File`]) {
    companyLogosSection[`companyLogo${i}`] =
      saveFile(req.files[`companyLogo${i}File`], "homepage");
  }
});


// Defined Us
[1,2,3,4,5,6].forEach((i) => {
  if (req.files?.[`definedUsLogo${i}File`]) {
    definedUsSection[`definedUsLogo${i}`] = saveFile(req.files[`definedUsLogo${i}File`], "homepage");
  }
});

// Core Values
if (req.files?.coreImageFile) {
  coreValuesSection.coreImage = saveFile(req.files.coreImageFile, "homepage");
}

    let homepage = await Homepage.findOne();
    if (!homepage) {
      homepage = new Homepage({});
    }

    if (Object.keys(heroSection).length) {
      homepage.heroSection = { ...homepage.heroSection?.toObject(), ...heroSection };
    }
    if (Object.keys(whoWeAreSection).length) {
      homepage.whoWeAreSection = { ...homepage.whoWeAreSection?.toObject(), ...whoWeAreSection };
    }
    if (Object.keys(whatWeDoSection).length) {
      homepage.whatWeDoSection = { ...homepage.whatWeDoSection?.toObject(), ...whatWeDoSection };
    }
    if (Object.keys(companyLogosSection).length) {
      homepage.companyLogosSection = { ...homepage.companyLogosSection?.toObject(), ...companyLogosSection };
    }
    if (Object.keys(definedUsSection).length) {
      homepage.definedUsSection = { ...homepage.definedUsSection?.toObject(), ...definedUsSection };
    }
    if (Object.keys(coreValuesSection).length) {
      homepage.coreValuesSection = { ...homepage.coreValuesSection?.toObject(), ...coreValuesSection };
    }

    await homepage.save();
    res.json({ message: "Homepage updated successfully", homepage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

