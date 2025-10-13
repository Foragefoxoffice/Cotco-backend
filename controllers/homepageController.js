const path = require("path");
const fs = require("fs");
const Homepage = require("../models/Homepage");

/* =========================================================
   🔹 Helper: Save Uploaded File
========================================================= */
const saveFile = (file, folder = "homepage") => {
  try {
    const uploadDir = path.join(__dirname, `../uploads/${folder}`);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    file.mv(filePath, (err) => {
      if (err) console.error("❌ File move error:", err);
    });

    return `/uploads/${folder}/${file.name}`;
  } catch (err) {
    console.error("❌ saveFile failed:", err);
    return "";
  }
};

/* =========================================================
   🔹 Helper: Safe JSON Parser
========================================================= */
const safeParse = (v) => {
  if (!v) return {};
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    console.error("❌ JSON parse failed for:", v);
    return {};
  }
};

/* =========================================================
   ✅ GET Homepage
========================================================= */
exports.getHomepage = async (req, res) => {
  try {
    const homepage = await Homepage.findOne();
    res.json(homepage || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   ✅ UPDATE Homepage (with SEO + File Uploads)
========================================================= */
exports.updateHomepage = async (req, res) => {
  try {
    console.log("===== 📩 Incoming Homepage Update =====");
    console.log("🧩 Body keys:", Object.keys(req.body || {}));
    console.log("📦 Files:", req.files ? Object.keys(req.files) : "No files");

    const data = req.body;

    // ✅ Safe JSON parsing for all sections
    let heroSection = safeParse(data.heroSection);
    let whoWeAreSection = safeParse(data.whoWeAreSection);
    let whatWeDoSection = safeParse(data.whatWeDoSection);
    let companyLogosSection = safeParse(data.companyLogosSection);
    let definedUsSection = safeParse(data.definedUsSection);
    let coreValuesSection = safeParse(data.coreValuesSection);
    let blogSection = safeParse(data.blogSection);
    let bannerSection = safeParse(data.bannerSection);
    let seoMeta = safeParse(data.seoMeta);

    /* =========================================================
       🔹 File Upload Handlers
    ========================================================== */

    // Hero Section
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
    ["Icon1File", "Icon2File", "Icon3File", "Img1File", "Img2File", "Img3File"].forEach(
      (field) => {
        const key = field.replace("File", "");
        if (req.files?.[`whatWeDo${field}`]) {
          whatWeDoSection[`whatWeDo${key}`] = saveFile(
            req.files[`whatWeDo${field}`],
            "homepage"
          );
        }
      }
    );

    // Company Logos
    if (Array.isArray(companyLogosSection.logos)) {
      companyLogosSection.logos = companyLogosSection.logos.map((logo, i) => {
        const fileKey = `partnerLogo${i}`;
        if (req.files?.[fileKey]) {
          return { url: saveFile(req.files[fileKey], "partners") };
        }
        return { url: logo.url || "" };
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
      coreValuesSection.coreImage = saveFile(req.files.coreImageFile, "homepage");
    }

    // Blog
    if (req.files?.blogImageFile) {
      blogSection.blogImage = saveFile(req.files.blogImageFile, "homepage");
    }

    // Banner
    if (req.files?.bannerBackgroundImageFile) {
      bannerSection.bannerBackgroundImage = saveFile(
        req.files.bannerBackgroundImageFile,
        "homepage"
      );
    }

    // ✅ Normalize all file fields before saving
const ensureString = (obj, key) => {
  if (obj && typeof obj[key] === "object") {
    obj[key] = "";
  }
};

// Fix malformed image/video fields
ensureString(bannerSection, "bannerBackgroundImage");
ensureString(heroSection, "bgUrl");
ensureString(whoWeAreSection, "whoWeArebannerImage");
ensureString(coreValuesSection, "coreImage");
ensureString(blogSection, "blogImage");

// WhatWeDo images
["whatWeDoIcon1", "whatWeDoIcon2", "whatWeDoIcon3", "whatWeDoImg1", "whatWeDoImg2", "whatWeDoImg3"].forEach((key) =>
  ensureString(whatWeDoSection, key)
);

    /* =========================================================
       🔹 Merge Updated Data into MongoDB Safely
    ========================================================== */

    let homepage = await Homepage.findOne();
    if (!homepage) homepage = new Homepage({});

    const safeMerge = (target, source) => ({
      ...(target?.toObject?.() || target || {}),
      ...source,
    });

    if (Object.keys(heroSection).length)
      homepage.heroSection = safeMerge(homepage.heroSection, heroSection);

    if (Object.keys(whoWeAreSection).length)
      homepage.whoWeAreSection = safeMerge(homepage.whoWeAreSection, whoWeAreSection);

    if (Object.keys(whatWeDoSection).length)
      homepage.whatWeDoSection = safeMerge(homepage.whatWeDoSection, whatWeDoSection);

    if (Object.keys(companyLogosSection).length)
      homepage.companyLogosSection = safeMerge(
        homepage.companyLogosSection,
        companyLogosSection
      );

    if (Object.keys(definedUsSection).length)
      homepage.definedUsSection = safeMerge(homepage.definedUsSection, definedUsSection);

    if (Object.keys(coreValuesSection).length)
      homepage.coreValuesSection = safeMerge(homepage.coreValuesSection, coreValuesSection);

    if (Object.keys(blogSection).length)
      homepage.blogSection = safeMerge(homepage.blogSection, blogSection);

    if (Object.keys(bannerSection).length)
      homepage.bannerSection = safeMerge(homepage.bannerSection, bannerSection);

    if (Object.keys(seoMeta).length)
      homepage.seoMeta = safeMerge(homepage.seoMeta, seoMeta);

    await homepage.save();

    /* =========================================================
       ✅ Success Response
    ========================================================== */
    res.json({
      success: true,
      message: "Homepage updated successfully",
      homepage,
    });
    console.log("===== 📩 Incoming Homepage Update =====");
console.log("Body keys:", Object.keys(req.body || {}));
console.log("Files:", req.files ? Object.keys(req.files) : "No files");

  } catch (err) {
    console.error("🔥 Homepage update failed:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
};
