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
    let fiberSustainability = safeParse(
      data.fiberSustainability,
      existing.fiberSustainability || {}
    );
    let fiberChooseUs = safeParse(
      data.fiberChooseUs,
      existing.fiberChooseUs || {}
    );
    let fiberSupplier = safeParse(
      data.fiberSupplier,
      existing.fiberSupplier || {}
    );
    let fiberProducts = safeParse(
      data.fiberProducts,
      existing.fiberProducts || {}
    );
    let fiberCertification = safeParse(
      data.fiberCertification,
      existing.fiberCertification || {}
    );

    // TODO: handle file uploads like cottonPage (imgs, videos, etc.)

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
