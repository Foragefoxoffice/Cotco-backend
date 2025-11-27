const fs = require("fs");
const path = require("path");
const MachineCMS = require("../models/MachineCMS");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

/* =========================================================
   🔹 Helper: Save Uploaded File (works with useTempFiles=true)
========================================================= */
const saveFile = (file, folder = "machinecms") => {
  try {
    const uploadDir = path.resolve(__dirname, `../uploads/${folder}`);
    fs.mkdirSync(uploadDir, { recursive: true });

    const safeFileName = file.name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    const finalFileName = `${Date.now()}_${safeFileName}`;
    const destPath = path.join(uploadDir, finalFileName);

    file.mv(destPath, (err) => {
      if (err) console.error("❌ File move error:", err);
      else console.log("✅ File saved:", destPath);
    });

    return `uploads/${folder}/${finalFileName}`;
  } catch (err) {
    console.error("❌ saveFile failed:", err);
    return "";
  }
};


/* =========================================================
   ✅ GET Machine CMS Page
========================================================= */
exports.getMachineCMSPage = async (req, res) => {
  try {
    let page = await MachineCMS.findOne();

    // create new document if none exists
    if (!page) {
      page = await MachineCMS.create({
        heroSection: { heroVideo: "", heroTitle: { en: "", vi: "" } },
        introSection: { introDescription: { en: "", vi: "" } },
        benefitsSection: {
          benefitTitle: { en: "", vi: "" },
          benefitImage: "",
          benefitBullets: { en: [""], vi: [""] },
        },
        machineTeamSection: {
          aboutTeamIntro: {
            tag: { en: "", vi: "" },
            heading: { en: "", vi: "" },
            description: { en: "", vi: "" },
          },
          aboutTeam: {},
        },
        seoMeta: {
          metaTitle: { en: "", vi: "" },
          metaDescription: { en: "", vi: "" },
          metaKeywords: { en: "", vi: "" },
        },
      });
    }

    // normalize URLs
    if (
      page.heroSection.heroVideo &&
      !page.heroSection.heroVideo.startsWith("http")
    ) {
      page.heroSection.heroVideo = `${BASE_URL}/${page.heroSection.heroVideo.replace(
        /^\/+/,
        ""
      )}`;
    }

    if (
      page.benefitsSection.benefitImage &&
      !page.benefitsSection.benefitImage.startsWith("http")
    ) {
      page.benefitsSection.benefitImage = `${BASE_URL}/${page.benefitsSection.benefitImage.replace(
        /^\/+/,
        ""
      )}`;
    }

    res.status(200).json({ success: true, machinePage: page });
  } catch (err) {
    console.error("❌ Error fetching Machine CMS Page:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   ✅ UPDATE Machine CMS Page (handles video & images)
========================================================= */
exports.updateMachineCMSPage = async (req, res) => {
  try {
    console.log("===== 📩 MachineCMS Update Incoming =====");
    console.log("🧩 Body keys:", Object.keys(req.body || {}));
    console.log("📦 Files:", req.files ? Object.keys(req.files) : "No files");

    const updateData = req.body.machinePage
      ? JSON.parse(req.body.machinePage)
      : req.body;

    // ✅ Save hero video if provided
    if (req.files?.heroVideo) {
      console.log("🎥 Hero video detected:", req.files.heroVideo.name);
      const savedPath = saveFile(req.files.heroVideo, "machinecms");
      updateData.heroSection = updateData.heroSection || {};
      updateData.heroSection.heroVideo = savedPath;
    } else {
      console.log("⚠️ No heroVideo file uploaded");
    }

    // ✅ Save benefit image if provided
    if (req.files?.benefitImage) {
      console.log("🖼 Benefit image detected:", req.files.benefitImage.name);
      const savedPath = saveFile(req.files.benefitImage, "machinecms");
      updateData.benefitsSection = updateData.benefitsSection || {};
      updateData.benefitsSection.benefitImage = savedPath;
    } else {
      console.log("⚠️ No benefitImage file uploaded");
    }

    // ✅ Find or create document
    let page = await MachineCMS.findOne();
    if (page) {
      page = await MachineCMS.findByIdAndUpdate(page._id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      page = await MachineCMS.create(updateData);
    }

    // ✅ Normalize URLs
    if (
      page.heroSection.heroVideo &&
      !page.heroSection.heroVideo.startsWith("http")
    ) {
      page.heroSection.heroVideo = `${BASE_URL}/${page.heroSection.heroVideo.replace(
        /^\/+/,
        ""
      )}`;
    }

    if (
      page.benefitsSection.benefitImage &&
      !page.benefitsSection.benefitImage.startsWith("http")
    ) {
      page.benefitsSection.benefitImage = `${BASE_URL}/${page.benefitsSection.benefitImage.replace(
        /^\/+/,
        ""
      )}`;
    }

    console.log("✅ MachineCMS updated successfully:", {
      video: page.heroSection.heroVideo,
      benefitImage: page.benefitsSection.benefitImage,
    });

    res.status(200).json({ success: true, machinePage: page });
  } catch (err) {
    console.error("🔥 MachineCMS update failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
