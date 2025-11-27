// controllers/machineController.js
const path = require("path");
const fs = require("fs");

const MachineCategory = require("../models/MachineCategory");
const MachinePage = require("../models/MachinePage");
const MachineSection = require("../models/MachineSection");

/* =========================================================
   Helper: File Upload
   - Supports files coming from express-fileupload (file.mv or tempFilePath)
   - Returns the public path used by your app, e.g. /uploads/<folder>/<file>
========================================================= */
const handleFileUpload = async (file, folder = "machines") => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, `../uploads/${folder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);

      // Move from tempFilePath if available (some middlewares provide this)
      if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
        fs.rename(file.tempFilePath, filePath, (err) => {
          if (err) return reject(err);
          resolve(`/uploads/${folder}/${fileName}`);
        });
      } else if (typeof file.mv === "function") {
        // express-fileupload style
        file.mv(filePath, (err) => {
          if (err) return reject(err);
          resolve(`/uploads/${folder}/${fileName}`);
        });
      } else if (file.path && fs.existsSync(file.path)) {
        // fallback when multer-like file.path exists
        fs.rename(file.path, filePath, (err) => {
          if (err) return reject(err);
          resolve(`/uploads/${folder}/${fileName}`);
        });
      } else {
        // cannot handle file object
        reject(new Error("Unsupported file object structure"));
      }
    } catch (err) {
      reject(err);
    }
  });
};

/* =========================================================
   Helpers: JSON parsing & multilingual normalization
========================================================= */
const safeJSON = (value, fallback = {}) => {
  try {
    if (!value && value !== "") return fallback;
    return typeof value === "string" ? JSON.parse(value) : value || fallback;
  } catch {
    return fallback;
  }
};

const normalizeLang = (obj = {}) => ({
  en: obj?.en ?? "",
  vi: obj?.vi ?? "",
});

/* =========================================================
   MACHINE CATEGORY CRUD
========================================================= */
exports.createMachineCategory = async (req, res) => {
  try {
    // Accept name/description possibly as JSON strings
    req.body.name = safeJSON(req.body.name, { en: "", vi: "" });
    req.body.description = safeJSON(req.body.description, { en: "", vi: "" });
    req.body.createMachineCatTitle = safeJSON(req.body.createMachineCatTitle, { en: "", vi: "" });
    req.body.createMachineCatDes = safeJSON(req.body.createMachineCatDes, { en: "", vi: "" });

    if (!req.body.slug) {
      return res.status(400).json({ success: false, error: "Slug is required" });
    }

    const existing = await MachineCategory.findOne({ slug: req.body.slug.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Slug already exists. Please use a unique slug.",
      });
    }

    // Upload optional files
    req.body.image = req.files?.image ? await handleFileUpload(req.files.image, "categories") : "";
    req.body.icon = req.files?.icon ? await handleFileUpload(req.files.icon, "categories") : "";
    req.body.createMachineCatBgImage = req.files?.createMachineCatBgImage
      ? await handleFileUpload(req.files.createMachineCatBgImage, "categories")
      : "";

    const category = await MachineCategory.create({
      name: normalizeLang(req.body.name),
      description: normalizeLang(req.body.description),
      slug: req.body.slug.trim(),
      image: req.body.image,
      icon: req.body.icon,
      createMachineCatTitle: normalizeLang(req.body.createMachineCatTitle),
      createMachineCatDes: normalizeLang(req.body.createMachineCatDes),
      createMachineCatBgImage: req.body.createMachineCatBgImage,
    });

    res.status(201).json({
      success: true,
      message: "Machine category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("❌ Create MachineCategory Error:", err);
    res.status(400).json({
      success: false,
      error: err.message || "Failed to create category",
    });
  }
};

exports.getMachineCategories = async (req, res) => {
  try {
    const categories = await MachineCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("Get Categories Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachineCategory = async (req, res) => {
  try {
    const category = await MachineCategory.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    console.error("Get MachineCategory Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMachineCategory = async (req, res) => {
  try {
    if (req.body.name && typeof req.body.name === "string")
      req.body.name = safeJSON(req.body.name, { en: "", vi: "" });
    if (req.body.description && typeof req.body.description === "string")
      req.body.description = safeJSON(req.body.description, { en: "", vi: "" });
    if (req.body.createMachineCatTitle && typeof req.body.createMachineCatTitle === "string")
      req.body.createMachineCatTitle = safeJSON(req.body.createMachineCatTitle, { en: "", vi: "" });
    if (req.body.createMachineCatDes && typeof req.body.createMachineCatDes === "string")
      req.body.createMachineCatDes = safeJSON(req.body.createMachineCatDes, { en: "", vi: "" });

    if (req.files?.image) req.body.image = await handleFileUpload(req.files.image, "categories");
    if (req.files?.icon) req.body.icon = await handleFileUpload(req.files.icon, "categories");
    if (req.files?.createMachineCatBgImage)
      req.body.createMachineCatBgImage = await handleFileUpload(req.files.createMachineCatBgImage, "categories");

    // Convert fields to normalized structure
    const payload = {
      ...req.body,
    };

    if (payload.name) payload.name = normalizeLang(payload.name);
    if (payload.description) payload.description = normalizeLang(payload.description);
    if (payload.createMachineCatTitle) payload.createMachineCatTitle = normalizeLang(payload.createMachineCatTitle);
    if (payload.createMachineCatDes) payload.createMachineCatDes = normalizeLang(payload.createMachineCatDes);

    const category = await MachineCategory.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    console.error("Update Category Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMachineCategory = async (req, res) => {
  try {
    const category = await MachineCategory.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================================
   MACHINE SECTION CRUD
========================================================= */
exports.createMachineSection = async (req, res) => {
  try {
    if (req.files?.image) req.body.image = await handleFileUpload(req.files.image, "sections");

    // Normalize multilingual fields if passed as stringified JSON
    if (req.body.title && typeof req.body.title === "string")
      req.body.title = safeJSON(req.body.title, { en: "", vi: "" });
    if (req.body.description && typeof req.body.description === "string")
      req.body.description = safeJSON(req.body.description, { en: "", vi: "" });

    const sectionPayload = {
      ...req.body,
      title: normalizeLang(req.body.title),
      description: normalizeLang(req.body.description),
    };

    const section = await MachineSection.create(sectionPayload);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    console.error("Create MachineSection Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMachineSections = async (req, res) => {
  try {
    const sections = await MachineSection.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sections });
  } catch (err) {
    console.error("Get Sections Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachineSection = async (req, res) => {
  try {
    const section = await MachineSection.findById(req.params.id);
    if (!section)
      return res.status(404).json({ success: false, message: "Section not found" });
    res.status(200).json({ success: true, data: section });
  } catch (err) {
    console.error("Get MachineSection Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMachineSection = async (req, res) => {
  try {
    if (req.files?.image) req.body.image = await handleFileUpload(req.files.image, "sections");

    if (req.body.title && typeof req.body.title === "string")
      req.body.title = safeJSON(req.body.title, { en: "", vi: "" });
    if (req.body.description && typeof req.body.description === "string")
      req.body.description = safeJSON(req.body.description, { en: "", vi: "" });

    const payload = {
      ...req.body,
    };
    if (payload.title) payload.title = normalizeLang(payload.title);
    if (payload.description) payload.description = normalizeLang(payload.description);

    const section = await MachineSection.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!section)
      return res.status(404).json({ success: false, message: "Section not found" });
    res.status(200).json({ success: true, data: section });
  } catch (err) {
    console.error("Update MachineSection Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMachineSection = async (req, res) => {
  try {
    const section = await MachineSection.findByIdAndDelete(req.params.id);
    if (!section)
      return res.status(404).json({ success: false, message: "Section not found" });
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (err) {
    console.error("Delete MachineSection Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================================
   MACHINE PAGE CRUD
   - processSectionFiles handles nested image keys that refer to req.files keys
========================================================= */
async function processSectionFiles(section, files) {
  // Work on a shallow copy to avoid modifying original reference
  const updated = { ...section };

  // If section.image contains a key that matches files, upload it
  if (updated.image && files[updated.image]) {
    try {
      updated.image = await handleFileUpload(files[updated.image], "sections");
    } catch (e) {
      console.warn("Failed to upload section.image:", e);
    }
  }

  // Blocks: each block may contain image keys
  if (Array.isArray(updated.blocks)) {
    updated.blocks = await Promise.all(
      updated.blocks.map(async (block) => {
        const b = { ...block };
        if (b.image && files[b.image]) {
          try {
            b.image = await handleFileUpload(files[b.image], "blocks");
          } catch (e) {
            console.warn("Failed to upload block image:", e);
          }
        }
        // normalize multilingual fields if present
        if (b.title && typeof b.title === "string") b.title = safeJSON(b.title, { en: "", vi: "" });
        if (b.description && typeof b.description === "string") b.description = safeJSON(b.description, { en: "", vi: "" });
        b.title = normalizeLang(b.title);
        b.description = normalizeLang(b.description);
        return b;
      })
    );
  }

  // Tabs: each tab contains sections (recursive)
  if (Array.isArray(updated.tabs)) {
    updated.tabs = await Promise.all(
      updated.tabs.map(async (tab) => {
        const t = { ...tab };
        // normalize tabTitle
        if (t.tabTitle && typeof t.tabTitle === "string") t.tabTitle = safeJSON(t.tabTitle, { en: "", vi: "" });
        t.tabTitle = normalizeLang(t.tabTitle);

        if (Array.isArray(t.sections)) {
          t.sections = await Promise.all(t.sections.map((s) => processSectionFiles(s, files)));
        } else {
          t.sections = [];
        }
        return t;
      })
    );
  }

  // Table rows: normalize multilingual cells
  if (updated.table) {
    try {
      if (typeof updated.table === "string") updated.table = safeJSON(updated.table, { header: { en: "", vi: "" }, rows: [] });
      if (updated.table.header && typeof updated.table.header === "string") updated.table.header = safeJSON(updated.table.header, { en: "", vi: "" });
      updated.table.header = normalizeLang(updated.table.header);
      if (Array.isArray(updated.table.rows)) {
        updated.table.rows = updated.table.rows.map((row) =>
          Array.isArray(row) ? row.map((cell) => normalizeLang(typeof cell === "string" ? safeJSON(cell, { en: "", vi: "" }) : cell)) : []
        );
      } else {
        updated.table.rows = [];
      }
    } catch (e) {
      // fallback: keep as-is
    }
  }

  // Title/description normalization for section itself
  if (updated.title && typeof updated.title === "string") updated.title = safeJSON(updated.title, { en: "", vi: "" });
  if (updated.description && typeof updated.description === "string") updated.description = safeJSON(updated.description, { en: "", vi: "" });
  updated.title = normalizeLang(updated.title);
  updated.description = normalizeLang(updated.description);

  return updated;
}

exports.createMachinePage = async (req, res) => {
  try {
    if (req.files?.banner) req.body.banner = await handleFileUpload(req.files.banner, "pages");

    // Parse JSON fields if they arrived as strings
    ["title", "description", "seo", "sections"].forEach((key) => {
      if (req.body[key] && typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch {
          // keep original value if parse fails
          req.body[key] = safeJSON(req.body[key], req.body[key]);
        }
      }
    });

    let cleanedSections = [];
    if (req.body.sections && Array.isArray(req.body.sections)) {
      cleanedSections = await Promise.all(req.body.sections.map((s) => processSectionFiles(s, req.files || {})));
    }

    const page = await MachinePage.create({
      category: req.body.categoryId,
      title: normalizeLang(req.body.title),
      description: normalizeLang(req.body.description),
      slug: req.body.slug,
      banner: req.body.banner || null,
      sections: cleanedSections,
      seo: req.body.seo || {},
    });

    res.status(201).json({ success: true, data: page });
  } catch (err) {
    console.error("Create MachinePage Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateMachinePage = async (req, res) => {
  try {
    // Handle banner upload if present
    if (req.files?.banner) {
      req.body.banner = await handleFileUpload(req.files.banner, "pages");
    }

    // Parse JSON string fields safely
    ["title", "description", "seo", "sections"].forEach((key) => {
      if (req.body[key] && typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch {
          req.body[key] = safeJSON(req.body[key], req.body[key]);
        }
      }
    });

    // Load existing to merge multilingual fields
    const existingPage = await MachinePage.findById(req.params.id);
    if (!existingPage) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    // Merge multilingual title/description to preserve existing values when client sends partial data
    const mergedTitle = {
      en: req.body.title?.en ?? existingPage.title?.en ?? "",
      vi: req.body.title?.vi ?? existingPage.title?.vi ?? "",
    };

    const mergedDescription = {
      en: req.body.description?.en ?? existingPage.description?.en ?? "",
      vi: req.body.description?.vi ?? existingPage.description?.vi ?? "",
    };

    // Process nested section files if sections provided
    let cleanedSections = existingPage.sections || [];
    if (req.body.sections && Array.isArray(req.body.sections)) {
      cleanedSections = await Promise.all(req.body.sections.map((s) => processSectionFiles(s, req.files || {})));
    }

    // Merge SEO fields carefully
    const mergedSEO = {
      metaTitle: req.body.seo?.metaTitle ?? existingPage.seo?.metaTitle ?? "",
      metaDescription: req.body.seo?.metaDescription ?? existingPage.seo?.metaDescription ?? "",
      keywords: req.body.seo?.keywords ?? existingPage.seo?.keywords ?? [],
      ogImage: req.body.seo?.ogImage ?? existingPage.seo?.ogImage ?? "",
    };

    // Build update payload
    const updateData = {
      category: req.body.categoryId || existingPage.category,
      title: normalizeLang(mergedTitle),
      description: normalizeLang(mergedDescription),
      slug: req.body.slug || existingPage.slug,
      banner: req.body.banner || existingPage.banner,
      sections: cleanedSections,
      seo: mergedSEO,
    };

    const updated = await MachinePage.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Update MachinePage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachinePages = async (req, res) => {
  try {
    const pages = await MachinePage.find().populate("category");
    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    console.error("Get MachinePages Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachinePage = async (req, res) => {
  try {
    const param = req.params.slug;
    let page;

    if (/^[0-9a-fA-F]{24}$/.test(param)) {
      page = await MachinePage.findById(param).populate("category");
    } else {
      page = await MachinePage.findOne({ slug: param }).populate("category");
    }

    if (!page) return res.status(404).json({ success: false, message: "Page not found" });

    res.status(200).json({ success: true, data: page });
  } catch (err) {
    console.error("Get MachinePage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMachinePage = async (req, res) => {
  try {
    const page = await MachinePage.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.status(200).json({ success: true, message: "Page deleted" });
  } catch (err) {
    console.error("Delete MachinePage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachinePagesByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await MachineCategory.findOne({ slug: categorySlug });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pages = await MachinePage.find({ category: category._id }).populate("category");
    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    console.error("getMachinePagesByCategorySlug Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
