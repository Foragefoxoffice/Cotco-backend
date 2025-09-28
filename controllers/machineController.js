const path = require("path");
const fs = require("fs");

const MainCategory = require("../models/MainCategory");
const MachineCategory = require("../models/MachineCategory");
const MachinePage = require("../models/MachinePage");
const MachineSection = require("../models/MachineSection");

/* =========================================================
   Helper: File Upload
========================================================= */
const handleFileUpload = async (file, folder = "machines") => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, `../uploads/${folder}`);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = Date.now() + path.extname(file.name);
      const filePath = path.join(uploadDir, fileName);

      file.mv(filePath, (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${folder}/${fileName}`);
      });
    } catch (err) {
      reject(err);
    }
  });
};

/* =========================================================
   MAIN CATEGORY CRUD
========================================================= */
exports.createMainCategory = async (req, res) => {
  try {
    // 🔹 Parse nested JSON fields
    if (req.body.name && typeof req.body.name === "string") {
      req.body.name = JSON.parse(req.body.name);
    }
    if (req.body.description && typeof req.body.description === "string") {
      req.body.description = JSON.parse(req.body.description);
    }

    // 🔹 Handle file
    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(
        req.files.image,
        "maincategories"
      );
    }

    const mainCategory = await MainCategory.create(req.body);

    res.status(201).json({ success: true, data: mainCategory });
  } catch (err) {
    console.error("Create MainCategory Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};


exports.getMainCategories = async (req, res) => {
  try {
    const mainCategories = await MainCategory.find();
    res.status(200).json({ success: true, data: mainCategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMainCategory = async (req, res) => {
  try {
    const mainCategory = await MainCategory.findById(req.params.id);
    if (!mainCategory)
      return res.status(404).json({ success: false, message: "Main category not found" });
    res.status(200).json({ success: true, data: mainCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMainCategory = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(req.files.image, "maincategories");
    }
    const mainCategory = await MainCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mainCategory)
      return res.status(404).json({ success: false, message: "Main category not found" });
    res.status(200).json({ success: true, data: mainCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteMainCategory = async (req, res) => {
  try {
    const mainCategory = await MainCategory.findByIdAndDelete(req.params.id);
    if (!mainCategory)
      return res.status(404).json({ success: false, message: "Main category not found" });
    res.status(200).json({ success: true, message: "Main category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================================
   MACHINE CATEGORY CRUD
========================================================= */
exports.createMachineCategory = async (req, res) => {
  try {
    // 🔹 Parse nested JSON fields
    if (req.body.name && typeof req.body.name === "string") {
      req.body.name = JSON.parse(req.body.name);
    }
    if (req.body.description && typeof req.body.description === "string") {
      req.body.description = JSON.parse(req.body.description);
    }

    // 🔹 Map mainCategoryId → mainCategory
    if (req.body.mainCategoryId) {
      req.body.mainCategory = req.body.mainCategoryId;
      delete req.body.mainCategoryId;
    }

    // 🔹 Handle uploads
    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(req.files.image, "categories");
    }
    if (req.files && req.files.icon) {
      req.body.icon = await handleFileUpload(req.files.icon, "categories");
    }

    const category = new MachineCategory(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      message: "Machine category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("Create MachineCategory Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};


exports.getMachineCategories = async (req, res) => {
  try {
    const categories = await MachineCategory.find().populate("mainCategory");
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMachineCategory = async (req, res) => {
  try {
    // 🔹 Parse JSON fields
    if (req.body.name && typeof req.body.name === "string") {
      req.body.name = JSON.parse(req.body.name);
    }
    if (req.body.description && typeof req.body.description === "string") {
      req.body.description = JSON.parse(req.body.description);
    }

    // 🔹 Map mainCategoryId → mainCategory
    if (req.body.mainCategoryId) {
      req.body.mainCategory = req.body.mainCategoryId;
      delete req.body.mainCategoryId;
    }

    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(req.files.image, "categories");
    }
    if (req.files && req.files.icon) {
      req.body.icon = await handleFileUpload(req.files.icon, "categories");
    }

    const category = await MachineCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, data: category });
  } catch (err) {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================================
   MACHINE SECTION CRUD
========================================================= */
exports.createMachineSection = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(req.files.image, "sections");
    }
    const section = await MachineSection.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getMachineSections = async (req, res) => {
  try {
    const sections = await MachineSection.find();
    res.status(200).json({ success: true, data: sections });
  } catch (err) {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMachineSection = async (req, res) => {
  try {
    if (req.files && req.files.image) {
      req.body.image = await handleFileUpload(req.files.image, "sections");
    }
    const section = await MachineSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section)
      return res.status(404).json({ success: false, message: "Section not found" });
    res.status(200).json({ success: true, data: section });
  } catch (err) {
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
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================================
   MACHINE PAGE CRUD
========================================================= */

/* ---------- Helper: recursively clean sections ---------- */
function cleanSection(section) {
  const cleaned = { ...section };

  // Remove empty stuff
  if (cleaned.listItems?.length === 0) delete cleaned.listItems;
  if (cleaned.blocks?.length === 0) delete cleaned.blocks;
  if (cleaned.tabs?.length === 0) delete cleaned.tabs;
  if (cleaned.table && !cleaned.table.header && cleaned.table.rows?.length === 0) {
    delete cleaned.table;
  }

  // Recurse into tabs
  if (cleaned.tabs) {
    cleaned.tabs = cleaned.tabs.map((tab) => ({
      tabTitle: tab.tabTitle,
      sections: tab.sections ? tab.sections.map(cleanSection) : undefined,
    }));
  }

  return cleaned;
}

/* ---------- Create Page ---------- */
exports.createMachinePage = async (req, res) => {
  try {
    if (req.files?.banner) {
      req.body.banner = await handleFileUpload(req.files.banner, "pages");
    }

    // Parse JSON fields
    ["title", "description", "seo", "sections"].forEach((key) => {
      if (req.body[key] && typeof req.body[key] === "string") {
        req.body[key] = JSON.parse(req.body[key]);
      }
    });

    // Clean sections recursively
    const cleanedSections = (req.body.sections || []).map(cleanSection);

    const page = new MachinePage({
      category: req.body.categoryId,
      title: req.body.title,
      description: req.body.description,
      slug: req.body.slug,
      banner: req.body.banner,
      sections: cleanedSections.length ? cleanedSections : undefined,
      seo: req.body.seo || {},
    });

    await page.save();
    res.status(201).json({ success: true, data: page });
  } catch (err) {
    console.error("Create MachinePage Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/* ---------- Update Page ---------- */
exports.updateMachinePage = async (req, res) => {
  try {
    if (req.files?.banner) {
      req.body.banner = await handleFileUpload(req.files.banner, "pages");
    }

    ["title", "description", "seo", "sections"].forEach((key) => {
      if (req.body[key] && typeof req.body[key] === "string") {
        req.body[key] = JSON.parse(req.body[key]);
      }
    });

    if (req.body.sections) {
      req.body.sections = req.body.sections.map(cleanSection);
    }

    const page = await MachinePage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    console.error("Update MachinePage Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachinePages = async (req, res) => {
  try {
    const pages = await MachinePage.find().populate("category").populate("sections");
    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMachinePage = async (req, res) => {
  try {
    const page = await MachinePage.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("sections");
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.deleteMachinePage = async (req, res) => {
  try {
    const page = await MachinePage.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.status(200).json({ success: true, message: "Page deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔹 Get all pages by Category Slug
exports.getMachinePagesByCategorySlug = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    // Find the category by slug
    const category = await MachineCategory.findOne({ slug: categorySlug });
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    // Find all pages linked to that category
    const pages = await MachinePage.find({ category: category._id })
      .populate("category")
      .populate("sections");

    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    console.error("getMachinePagesByCategorySlug Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔹 Get all pages by MainCategory Slug
exports.getMachinePagesByMainCategorySlug = async (req, res) => {
  try {
    const { mainCategorySlug } = req.params;

    // Find the main category
    const mainCategory = await MainCategory.findOne({ slug: mainCategorySlug });
    if (!mainCategory)
      return res
        .status(404)
        .json({ success: false, message: "Main category not found" });

    // Find all categories under that main category
    const categories = await MachineCategory.find({
      mainCategory: mainCategory._id,
    });

    const categoryIds = categories.map((c) => c._id);

    // Get pages under those categories
    const pages = await MachinePage.find({ category: { $in: categoryIds } })
      .populate("category")
      .populate("sections");

    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    console.error("getMachinePagesByMainCategorySlug Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// 🔹 Get all categories by MainCategory Slug
exports.getMachineCategoriesByMainCategorySlug = async (req, res) => {
  try {
    const { mainCategorySlug } = req.params;

    // Find main category
    const mainCategory = await MainCategory.findOne({ slug: mainCategorySlug });
    if (!mainCategory)
      return res
        .status(404)
        .json({ success: false, message: "Main category not found" });

    // Find categories under this main category
    const categories = await MachineCategory.find({
      mainCategory: mainCategory._id,
    }).populate("mainCategory");

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("getMachineCategoriesByMainCategorySlug Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
