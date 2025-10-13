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

    // ---------------- SAVE ----------------
    existing.fiberBanner = fiberBanner;
    existing.fiberSustainability = fiberSustainability;
    existing.fiberChooseUs = fiberChooseUs;
    existing.fiberSupplier = fiberSupplier;
    existing.fiberProducts = fiberProducts;
    existing.fiberCertification = fiberCertification;
    existing.seoMeta = seoMeta; // ✅ Save SEO Meta

    await existing.save();
    res.json({ message: "Fiber Page updated successfully", fiber: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

