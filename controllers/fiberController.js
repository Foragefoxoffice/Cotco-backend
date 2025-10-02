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
    let data = req.body;
    let existing = await FiberPage.findOne();
    if (!existing) existing = new FiberPage({});

    // parse sections
    let fiberBanner = safeParse(data.fiberBanner, existing.fiberBanner || {});
    let fiberSustainability = safeParse(data.fiberSustainability, existing.fiberSustainability || {});
    let fiberChooseUs = safeParse(data.fiberChooseUs, existing.fiberChooseUs || {});
    let fiberSupplier = safeParse(data.fiberSupplier, existing.fiberSupplier || {});
    let fiberProducts = safeParse(data.fiberProducts, existing.fiberProducts || {});
    let fiberCertification = safeParse(data.fiberCertification, existing.fiberCertification || {});

    /* ---------------- 1. BANNER ---------------- */
    if (req.files?.fiberBannerImgFile) {
      fiberBanner.fiberBannerImg = saveFile(req.files.fiberBannerImgFile, "fiber/banner");
    } else if (fiberBanner.fiberBannerImg === "") {
      fiberBanner.fiberBannerImg = "";
    } else {
      fiberBanner.fiberBannerImg = existing.fiberBanner?.fiberBannerImg || "";
    }

    if (req.files?.fiberBannerMediaFile) {
      fiberBanner.fiberBannerMedia = saveFile(req.files.fiberBannerMediaFile, "fiber/banner");
    } else if (fiberBanner.fiberBannerMedia === "") {
      fiberBanner.fiberBannerMedia = "";
    } else {
      fiberBanner.fiberBannerMedia = existing.fiberBanner?.fiberBannerMedia || "";
    }

    /* ---------------- 2. SUSTAINABILITY ---------------- */
    if (req.files?.fiberSustainabilityImgFile) {
      fiberSustainability.fiberSustainabilityImg = saveFile(req.files.fiberSustainabilityImgFile, "fiber/sustainability");
    } else if (fiberSustainability.fiberSustainabilityImg === "") {
      fiberSustainability.fiberSustainabilityImg = "";
    } else {
      fiberSustainability.fiberSustainabilityImg = existing.fiberSustainability?.fiberSustainabilityImg || "";
    }


    /* ---------------- 3. SUPPLIER (multi images) ---------------- */
    if (Array.isArray(fiberSupplier.fiberSupplierImg)) {
      fiberSupplier.fiberSupplierImg = fiberSupplier.fiberSupplierImg.map((img, i) => {
        if (req.files?.[`fiberSupplierImgFile${i}`]) {
          return saveFile(req.files[`fiberSupplierImgFile${i}`], "fiber/suppliers");
        } else if (img === "") {
          return "";
        } else {
          return existing?.fiberSupplier?.fiberSupplierImg?.[i] || "";
        }
      });
    }

    /* ---------------- 3. CHOOSE US (box images + icons) ---------------- */
    if (Array.isArray(fiberChooseUs.fiberChooseUsBox)) {
      fiberChooseUs.fiberChooseUsBox = fiberChooseUs.fiberChooseUsBox.map((box, i) => {
        if (req.files?.[`fiberChooseUsBoxBgFile${i}`]) {
          box.fiberChooseUsBoxBg = saveFile(req.files[`fiberChooseUsBoxBgFile${i}`], "fiber/chooseus");
        } else if (box.fiberChooseUsBoxBg === "") {
          box.fiberChooseUsBoxBg = "";
        } else {
          box.fiberChooseUsBoxBg = existing?.fiberChooseUs?.fiberChooseUsBox?.[i]?.fiberChooseUsBoxBg || "";
        }
        return box;
      });
    }


    /* ---------------- 4. PRODUCTS (multi products with img) ---------------- */
    if (Array.isArray(fiberProducts.fiberProduct)) {
      fiberProducts.fiberProduct = fiberProducts.fiberProduct.map((p, i) => {
        if (req.files?.[`fiberProductImgFile${i}`]) {
          p.fiberProductImg = saveFile(req.files[`fiberProductImgFile${i}`], "fiber/products");
        } else if (p.fiberProductImg === "") {
          p.fiberProductImg = "";
        } else {
          p.fiberProductImg = existing?.fiberProducts?.fiberProduct?.[i]?.fiberProductImg || "";
        }
        return p;
      });
    }

    /* ---------------- 5. CERTIFICATION (multi images) ---------------- */
    if (Array.isArray(fiberCertification.fiberCertificationImg)) {
      fiberCertification.fiberCertificationImg = fiberCertification.fiberCertificationImg
        .map((img, i) => {
          if (req.files?.[`fiberCertificationImgFile${i}`]) {
            return saveFile(req.files[`fiberCertificationImgFile${i}`], "fiber/certification");
          } else if (typeof img === "string" && img.trim() !== "") {
            return img; // keep valid existing path
          } else {
            return null; // remove empty slot
          }
        })
        .filter((v) => v); // ✅ remove null/empty
    }

    /* ---------------- SAVE ---------------- */
    existing.fiberBanner = fiberBanner;
    existing.fiberSustainability = fiberSustainability;
    existing.fiberChooseUs = fiberChooseUs;
    existing.fiberSupplier = fiberSupplier;
    existing.fiberProducts = fiberProducts;
    existing.fiberCertification = fiberCertification;

    await existing.save();
    res.json({ message: "Fiber Page updated successfully", fiber: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

