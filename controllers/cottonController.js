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

    // ---------- SAFE PARSING ----------
    const cottonBanner = safeParse(data.cottonBanner, existing.cottonBanner || {});
    const cottonSupplier = safeParse(data.cottonSupplier, existing.cottonSupplier || []);
    const cottonTrust = safeParse(data.cottonTrust, existing.cottonTrust || {});
    const cottonMember = safeParse(data.cottonMember, existing.cottonMember || {});
    const cottonTeam = safeParse(data.cottonTeam, existing.cottonTeam || {});
    let seoMeta = safeParse(data.cottonSeoMeta, existing.seoMeta || {});
    

    // ---------- BANNER ----------
    if (req.files?.cottonBannerImgFile) {
      cottonBanner.cottonBannerImg = saveFile(req.files.cottonBannerImgFile, "cotton/banner");
    } else if (cottonBanner.cottonBannerImg === "") {
      cottonBanner.cottonBannerImg = "";
    } else {
      cottonBanner.cottonBannerImg = existing.cottonBanner?.cottonBannerImg || "";
    }

    cottonBanner.cottonBannerOverview =
      cottonBanner.cottonBannerOverview ||
      existing.cottonBanner?.cottonBannerOverview || { en: "", vi: "" };

    let bannerSlides = Array.isArray(cottonBanner.cottonBannerSlideImg)
  ? cottonBanner.cottonBannerSlideImg.filter(Boolean)
  : [];

if (req.files?.cottonBannerSlideImgFiles) {
  const files = Array.isArray(req.files.cottonBannerSlideImgFiles)
    ? req.files.cottonBannerSlideImgFiles
    : [req.files.cottonBannerSlideImgFiles];
  const uploaded = files.map((f) => saveFile(f, "cotton/banner/slides"));
  bannerSlides = [...uploaded]; // ✅ overwrite old, not append
}

cottonBanner.cottonBannerSlideImg = bannerSlides;


    // ---------- SUPPLIERS ----------
    const updatedSuppliers = Array.isArray(cottonSupplier)
      ? cottonSupplier.map((s, i) => {
          const updated = { ...s };
          if (req.files?.[`cottonSupplierLogoFile${i}`]) {
            updated.cottonSupplierLogo = saveFile(
              req.files[`cottonSupplierLogoFile${i}`],
              "cotton/suppliers/logos"
            );
          } else {
            updated.cottonSupplierLogo = existing.cottonSupplier?.[i]?.cottonSupplierLogo || "";
          }

          if (req.files?.[`cottonSupplierBgFile${i}`]) {
            updated.cottonSupplierBg = saveFile(
              req.files[`cottonSupplierBgFile${i}`],
              "cotton/suppliers/bg"
            );
          } else {
            updated.cottonSupplierBg = existing.cottonSupplier?.[i]?.cottonSupplierBg || "";
          }

          return updated;
        })
      : [];

    // ---------- TRUST ----------
    let trustLogos = Array.isArray(cottonTrust.cottonTrustLogo)
      ? cottonTrust.cottonTrustLogo.filter(Boolean)
      : [];

    if (req.files?.cottonTrustLogoFiles) {
      const files = Array.isArray(req.files.cottonTrustLogoFiles)
        ? req.files.cottonTrustLogoFiles
        : [req.files.cottonTrustLogoFiles];
      const uploaded = files.map((f) => saveFile(f, "cotton/trust"));
      trustLogos = [...trustLogos, ...uploaded];
    }
    cottonTrust.cottonTrustLogo = trustLogos;

    if (req.files?.cottonTrustImgFile) {
      cottonTrust.cottonTrustImg = saveFile(req.files.cottonTrustImgFile, "cotton/trust");
    } else if (cottonTrust.cottonTrustImg === "") {
      cottonTrust.cottonTrustImg = "";
    } else {
      cottonTrust.cottonTrustImg = existing.cottonTrust?.cottonTrustImg || "";
    }

    // ---------- MEMBER ----------
    let memberImgs = Array.isArray(cottonMember.cottonMemberImg)
      ? cottonMember.cottonMemberImg.filter(Boolean)
      : [];

    if (req.files?.cottonMemberImgFiles) {
      const files = Array.isArray(req.files.cottonMemberImgFiles)
        ? req.files.cottonMemberImgFiles
        : [req.files.cottonMemberImgFiles];
      const uploaded = files.map((f) => saveFile(f, "cotton/member"));
      memberImgs = [...memberImgs, ...uploaded];
    }
    cottonMember.cottonMemberImg = memberImgs;

    // ---------- TEAM ----------
    if (cottonTeam.aboutTeamIntro || cottonTeam.aboutTeam) {
      existing.cottonTeam = {
        aboutTeamIntro: cottonTeam.aboutTeamIntro || existing.cottonTeam?.aboutTeamIntro || {
          tag: { en: "", vi: "" },
          heading: { en: "", vi: "" },
          description: { en: "", vi: "" },
        },
        aboutTeam: cottonTeam.aboutTeam || existing.cottonTeam?.aboutTeam || {},
      };
    }

    // ---------- SEO META ----------
   seoMeta.metaTitle = {
  en: seoMeta.metaTitle?.en || "",
  vi: seoMeta.metaTitle?.vi || "",
};

seoMeta.metaDescription = {
  en: seoMeta.metaDescription?.en || "",
  vi: seoMeta.metaDescription?.vi || "",
};

seoMeta.metaKeywords = {
  en: seoMeta.metaKeywords?.en || "",
  vi: seoMeta.metaKeywords?.vi || "",
};

// ✅ Assign and merge safely
existing.seoMeta = {
  ...existing.seoMeta?.toObject?.(),
  ...seoMeta,
};

// ---------------- SAVE ----------------
existing.cottonBanner = cottonBanner;
existing.cottonSupplier = updatedSuppliers;
existing.cottonTrust = cottonTrust;
existing.cottonMember = cottonMember;
existing.cottonTeam = cottonTeam;

await existing.save();
res.json({ message: "SEO Meta updated successfully", cotton: existing });
  } catch (err) {
    console.error("❌ CottonPage update error:", err);
    res.status(500).json({ error: err.message });
  }
};
