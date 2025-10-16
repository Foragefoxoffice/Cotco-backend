const path = require("path");
const fs = require("fs");
const FiberPage = require("../models/FiberPage");

const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

const saveFile = (file, folder = "fiber") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ----------------
exports.getFiberPage = async (req, res) => {
  try {
    const fiber = await FiberPage.findOne();
    res.json(fiber || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- UPDATE ----------------
exports.updateFiberPage = async (req, res) => {
  try {
    const data = req.body;
    let existing = await FiberPage.findOne();
    if (!existing) existing = new FiberPage({});

    // 🔹 Parse all section data safely
    const fiberBanner = safeParse(data.fiberBanner, existing.fiberBanner || {});
    const fiberSustainability = safeParse(
      data.fiberSustainability,
      existing.fiberSustainability || {}
    );
    const fiberChooseUs = safeParse(
      data.fiberChooseUs,
      existing.fiberChooseUs || {}
    );
    const fiberSupplier = safeParse(
      data.fiberSupplier,
      existing.fiberSupplier || {}
    );
    const fiberProducts = safeParse(
      data.fiberProducts,
      existing.fiberProducts || {}
    );
    const fiberCertification = safeParse(
      data.fiberCertification,
      existing.fiberCertification || {}
    );
    const fiberTeam = safeParse(data.fiberTeam, existing.fiberTeam || {});


    // ✅ NEW: parse seoMeta data (matches frontend)
    const seoMeta = safeParse(data.fiberSeoMeta, existing.seoMeta || {});

    // ---------------- 🆕 SEO META ----------------
    if (req.files?.fiberSeoOgImageFile) {
      seoMeta.ogImage = saveFile(req.files.fiberSeoOgImageFile, "fiber/seo");
    } else if (seoMeta.ogImage === "") {
      seoMeta.ogImage = "";
    } else {
      seoMeta.ogImage = existing.seoMeta?.ogImage || "";
    }

    // ---------------- HANDLE FILE UPLOADS ----------------
if (req.files) {
  Object.keys(req.files).forEach((key) => {
    const file = req.files[key];
    if (!file || !file.name) return;

    // 🌐 Banner Media
    if (key.startsWith("fiberBannerMediaFile")) {
      fiberBanner.fiberBannerMedia = saveFile(file, "fiber/banner");
    }

    // 🌐 Banner Image
    if (key.startsWith("fiberBannerImgFile")) {
      fiberBanner.fiberBannerImg = saveFile(file, "fiber/banner");
    }

    // 🌿 Sustainability Image
    if (key.startsWith("fiberSustainabilityImgFile")) {
      fiberSustainability.fiberSustainabilityImg = saveFile(file, "fiber/sustainability");
    }

    // 💡 Choose Us Box Background
    if (key.startsWith("fiberChooseUsBoxBgFile")) {
      const index = parseInt(key.replace("fiberChooseUsBoxBgFile", ""));
      const saved = saveFile(file, "fiber/chooseus");
      if (!fiberChooseUs.fiberChooseUsBox) fiberChooseUs.fiberChooseUsBox = [];
      fiberChooseUs.fiberChooseUsBox[index] = fiberChooseUs.fiberChooseUsBox[index] || {};
      fiberChooseUs.fiberChooseUsBox[index].fiberChooseUsBoxBg = saved;
    }

    // 🏭 Supplier Images ✅✅ FIX ADDED HERE
    // 🏭 Supplier Images
if (key.startsWith("fiberSupplierImgFile")) {
  const index = parseInt(key.replace("fiberSupplierImgFile", ""));
  const saved = saveFile(file, "fiber/supplier");
  if (!Array.isArray(fiberSupplier.fiberSupplierImg))
    fiberSupplier.fiberSupplierImg = [];
  fiberSupplier.fiberSupplierImg[index] = saved;
}


    // 📦 Product Images
    if (key.startsWith("fiberProductImgFile")) {
      const index = parseInt(key.replace("fiberProductImgFile", ""));
      const saved = saveFile(file, "fiber/products");
      if (!fiberProducts.fiberProduct) fiberProducts.fiberProduct = [];
      fiberProducts.fiberProduct[index] = fiberProducts.fiberProduct[index] || {};
      fiberProducts.fiberProduct[index].fiberProductImg = saved;
    }

    // 🪪 Certification Images
    if (key.startsWith("fiberCertificationImgFile")) {
      const index = parseInt(key.replace("fiberCertificationImgFile", ""));
      const saved = saveFile(file, "fiber/certification");
      if (!Array.isArray(fiberCertification.fiberCertificationImg))
        fiberCertification.fiberCertificationImg = [];
      fiberCertification.fiberCertificationImg[index] = saved;
    }

    // 🌐 SEO OG Image
    if (key === "fiberSeoOgImageFile") {
      seoMeta.ogImage = saveFile(file, "fiber/seo");
    }
  });
}


    // ---------------- SAVE ----------------
    existing.fiberBanner = fiberBanner;
    existing.fiberSustainability = fiberSustainability;
    existing.fiberChooseUs = fiberChooseUs;
    existing.fiberSupplier = fiberSupplier;
    existing.fiberProducts = fiberProducts;
    existing.fiberCertification = fiberCertification;
    existing.fiberTeam = fiberTeam;
    existing.seoMeta = seoMeta; // ✅ Save SEO Meta

    await existing.save();
    res.json({ message: "Fiber Page updated successfully", fiber: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

