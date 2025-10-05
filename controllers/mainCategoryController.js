const path = require("path");
const fs = require("fs");
const MainCategory = require("../models/MainCategory");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Utility: ensure /public/uploads exists
const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, "..", "uploads","maincategory");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Utility: normalize FormData fields into nested objects
const normalizeBody = (body) => {
  const newBody = { ...body };

  // Handle name.en / name.vn
  if (body["name.en"] || body["name.vn"]) {
    newBody.name = {
      en: body["name.en"] || "",
      vn: body["name.vn"] || "",
    };
    delete newBody["name.en"];
    delete newBody["name.vn"];
  }

  // Handle bgImage.alt
  if (body["bgImage.alt"]) {
    newBody.bgImage = {
      ...(newBody.bgImage || {}),
      alt: body["bgImage.alt"],
    };
    delete newBody["bgImage.alt"];
  }

  return newBody;
};

// @desc    Create main category
// @route   POST /api/v1/main-categories
// @access  Private
exports.createMainCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

  // ✅ Normalize incoming fields
  req.body = normalizeBody(req.body);

  if (!req.body.name?.en) {
    return next(new ErrorResponse("English name is required", 400));
  }

  // ✅ Check duplicate EN name
  const existingByName = await MainCategory.findOne({
    "name.en": req.body.name.en.trim(),
  });
  if (existingByName) {
    return next(new ErrorResponse("Main category name already exists", 400));
  }

  // ✅ Ensure slug uniqueness
  let slug = req.body.slug?.trim();
  if (!slug) {
    return next(new ErrorResponse("Slug is required", 400));
  }
  let existingSlug = await MainCategory.findOne({ slug });
  let counter = 1;
  while (existingSlug) {
    slug = `${req.body.slug}-${counter}`;
    existingSlug = await MainCategory.findOne({ slug });
    counter++;
  }
  req.body.slug = slug;

  // ✅ Handle bgImage file upload
  if (req.files?.bgImageFile) {
    const file = req.files.bgImageFile;
    const uploadDir = ensureUploadDir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath); // save locally

    req.body.bgImage = {
      url: `/uploads/maincategory/${fileName}`,
      alt: req.body.bgImage?.alt || "",
    };
  }

  const mainCategory = await MainCategory.create(req.body);

  res.status(201).json({ success: true, data: mainCategory });
});

// @desc    Get all main categories
// @route   GET /api/v1/main-categories
// @access  Public
exports.getMainCategories = asyncHandler(async (req, res) => {
  const mainCategories = await MainCategory.find();
  res.status(200).json({
    success: true,
    count: mainCategories.length,
    data: mainCategories,
  });
});

// @desc    Get single main category
// @route   GET /api/v1/main-categories/:id
// @access  Public
exports.getMainCategory = asyncHandler(async (req, res, next) => {
  const mainCategory = await MainCategory.findById(req.params.id);
  if (!mainCategory) {
    return next(new ErrorResponse("Main category not found", 404));
  }
  res.status(200).json({ success: true, data: mainCategory });
});

// @desc    Update main category
// @route   PUT /api/v1/main-categories/:id
// @access  Private
exports.updateMainCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

  // ✅ Normalize incoming fields
  req.body = normalizeBody(req.body);

  // ✅ If name is changing, check duplicates
  if (req.body.name?.en || req.body.name?.vn) {
    const duplicate = await MainCategory.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { "name.en": req.body.name?.en?.trim() },
        { "name.vn": req.body.name?.vn?.trim() },
      ],
    });
    if (duplicate) {
      return next(
        new ErrorResponse("Another main category with this name already exists", 400)
      );
    }
  }

  // ✅ If slug is changing, check duplicates
  if (req.body.slug) {
    const duplicateSlug = await MainCategory.findOne({
      _id: { $ne: req.params.id },
      slug: req.body.slug.trim(),
    });
    if (duplicateSlug) {
      return next(new ErrorResponse("Slug already in use", 400));
    }
  }

  // ✅ Handle bgImage file upload
  if (req.files?.bgImageFile) {
    const file = req.files.bgImageFile;
    const uploadDir = ensureUploadDir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath);

    req.body.bgImage = {
      url: `/uploads/${fileName}`,
      alt: req.body.bgImage?.alt || "",
    };
  }

  const mainCategory = await MainCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!mainCategory) {
    return next(new ErrorResponse("Main category not found", 404));
  }

  res.status(200).json({ success: true, data: mainCategory });
});

// @desc    Delete main category
// @route   DELETE /api/v1/main-categories/:id
// @access  Private
exports.deleteMainCategory = asyncHandler(async (req, res, next) => {
  const mainCategory = await MainCategory.findByIdAndDelete(req.params.id);

  if (!mainCategory) {
    return next(new ErrorResponse("Main category not found", 404));
  }

  res.status(200).json({ success: true, data: {} });
});
