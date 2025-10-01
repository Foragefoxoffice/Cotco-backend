const path = require("path");
const fs = require("fs");
const CottonPage = require("../models/CottonPage");

const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

const saveFile = (file, folder = "cotton") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ----------------
exports.getCottonPage = async (req, res) => {
  try {
    const cotton = await CottonPage.findOne();
    res.json(cotton || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE ----------------
exports.updateCottonPage = async (req, res) => {
  try {
    let data = req.body;
    let existing = await CottonPage.findOne();
    if (!existing) existing = new CottonPage({});

    let cottonBanner = safeParse(data.cottonBanner, existing.cottonBanner || {});
    let cottonSupplier = safeParse(data.cottonSupplier, existing.cottonSupplier || []);
    let cottonTrust = safeParse(data.cottonTrust, existing.cottonTrust || {});
    let cottonMember = safeParse(data.cottonMember, existing.cottonMember || {});

    // ---------------- BANNER ----------------
    // Banner main image
    if (req.files?.cottonBannerImgFile) {
      cottonBanner.cottonBannerImg = saveFile(req.files.cottonBannerImgFile, "cotton/banner");
    } else if (cottonBanner.cottonBannerImg === "") {
      cottonBanner.cottonBannerImg = "";
    } else {
      cottonBanner.cottonBannerImg = existing.cottonBanner?.cottonBannerImg || "";
    }

    // ✅ Banner Overview
    cottonBanner.cottonBannerOverview = cottonBanner.cottonBannerOverview || existing.cottonBanner?.cottonBannerOverview || { en: "", vi: "" };

    // Banner Slide Images (multi upload)
    let bannerSlidesFromBody = Array.isArray(cottonBanner.cottonBannerSlideImg)
      ? cottonBanner.cottonBannerSlideImg.filter((img) => img !== "")
      : [];

    if (req.files?.cottonBannerSlideImgFiles) {
      const files = Array.isArray(req.files.cottonBannerSlideImgFiles)
        ? req.files.cottonBannerSlideImgFiles
        : [req.files.cottonBannerSlideImgFiles];
      const uploaded = files.map((f) => saveFile(f, "cotton/banner/slides"));
      bannerSlidesFromBody = [...bannerSlidesFromBody, ...uploaded];
    }
    cottonBanner.cottonBannerSlideImg = bannerSlidesFromBody;


    // ---------------- SUPPLIERS ----------------
    if (cottonSupplier.length > 0) {
      cottonSupplier = cottonSupplier.map((s, i) => {
        // If a new file is uploaded -> save it
        if (req.files?.[`cottonSupplierLogoFile${i}`]) {
          s.cottonSupplierLogo = saveFile(req.files[`cottonSupplierLogoFile${i}`], "cotton/suppliers");
        }
        // If frontend sent base64 by mistake -> fallback to existing value
        else if (s.cottonSupplierLogo?.startsWith("data:image")) {
          s.cottonSupplierLogo = existing?.cottonSupplier?.[i]?.cottonSupplierLogo || "";
        }
        // If cleared -> empty
        else if (s.cottonSupplierLogo === "") {
          s.cottonSupplierLogo = "";
        }
        // Otherwise keep existing DB path
        else {
          s.cottonSupplierLogo = existing?.cottonSupplier?.[i]?.cottonSupplierLogo || "";
        }
        return s;
      });
    }

    // ---------------- TRUST ----------------
    let trustLogosFromBody = Array.isArray(cottonTrust.cottonTrustLogo)
      ? cottonTrust.cottonTrustLogo.filter((logo) => logo !== "")
      : [];

    if (req.files?.cottonTrustLogoFiles) {
      const files = Array.isArray(req.files.cottonTrustLogoFiles)
        ? req.files.cottonTrustLogoFiles
        : [req.files.cottonTrustLogoFiles];
      const uploaded = files.map((f) => saveFile(f, "cotton/trust"));
      trustLogosFromBody = [...trustLogosFromBody, ...uploaded];
    }
    cottonTrust.cottonTrustLogo = trustLogosFromBody;

    // Trust Image (single)
    if (req.files?.cottonTrustImgFile) {
      cottonTrust.cottonTrustImg = saveFile(req.files.cottonTrustImgFile, "cotton/trust");
    } else if (cottonTrust.cottonTrustImg === "") {
      cottonTrust.cottonTrustImg = "";
    } else {
      cottonTrust.cottonTrustImg = existing.cottonTrust?.cottonTrustImg || "";
    }

    // ---------------- MEMBER ----------------
    let memberImgsFromBody = Array.isArray(cottonMember.cottonMemberImg)
      ? cottonMember.cottonMemberImg.filter((img) => img !== "")
      : [];

    if (req.files?.cottonMemberImgFiles) {
      const files = Array.isArray(req.files.cottonMemberImgFiles)
        ? req.files.cottonMemberImgFiles
        : [req.files.cottonMemberImgFiles];
      const uploaded = files.map((f) => saveFile(f, "cotton/member"));
      memberImgsFromBody = [...memberImgsFromBody, ...uploaded];
    }
    cottonMember.cottonMemberImg = memberImgsFromBody;

    // ---------------- SAVE ----------------
    existing.cottonBanner = cottonBanner;  // ✅ includes bannerOverview + slides
    existing.cottonSupplier = cottonSupplier;
    existing.cottonTrust = cottonTrust;
    existing.cottonMember = cottonMember;

    await existing.save();
    res.json({ message: "Cotton Page updated successfully", cotton: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

