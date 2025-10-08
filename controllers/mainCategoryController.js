const path = require("path");
const fs = require("fs");
const MainCategory = require("../models/MainCategory");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// Utility: ensure /public/uploads exists
const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, "..", "uploads", "maincategory");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// ✅ Normalize incoming form-data fields
const normalizeBody = (body) => {
  const newBody = { ...body };

  // ✅ Fix: use name.en / name.vi instead of vn
  if (body["name.en"] || body["name.vi"]) {
    newBody.name = {
      en: body["name.en"] || "",
      vi: body["name.vi"] || "",
    };
    delete newBody["name.en"];
    delete newBody["name.vi"];
  }

  if (body["bgImage.alt"]) {
    newBody.bgImage = {
      ...(newBody.bgImage || {}),
      alt: body["bgImage.alt"],
    };
    delete newBody["bgImage.alt"];
  }

  return newBody;
};

// ✅ CREATE
exports.createMainCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

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

  // ✅ Ensure unique slug
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

    await file.mv(filePath);

    req.body.bgImage = {
      url: `/uploads/maincategory/${fileName}`,
      alt: req.body.bgImage?.alt || "",
    };
  }

  const mainCategory = await MainCategory.create(req.body);
  res.status(201).json({ success: true, data: mainCategory });
});

// ✅ READ (All)
exports.getMainCategories = asyncHandler(async (req, res) => {
  const mainCategories = await MainCategory.find();
  res.status(200).json({
    success: true,
    count: mainCategories.length,
    data: mainCategories,
  });
});

// ✅ READ (Single)
exports.getMainCategory = asyncHandler(async (req, res, next) => {
  const mainCategory = await MainCategory.findById(req.params.id);
  if (!mainCategory) {
    return next(new ErrorResponse("Main category not found", 404));
  }
  res.status(200).json({ success: true, data: mainCategory });
});

// ✅ UPDATE
exports.updateMainCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

  req.body = normalizeBody(req.body);

  // ✅ Check duplicates
  if (req.body.name?.en || req.body.name?.vi) {
    const duplicate = await MainCategory.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { "name.en": req.body.name?.en?.trim() },
        { "name.vi": req.body.name?.vi?.trim() },
      ],
    });
    if (duplicate) {
      return next(
        new ErrorResponse("Another main category with this name already exists", 400)
      );
    }
  }

  // ✅ Check slug uniqueness
  if (req.body.slug) {
    const duplicateSlug = await MainCategory.findOne({
      _id: { $ne: req.params.id },
      slug: req.body.slug.trim(),
    });
    if (duplicateSlug) {
      return next(new ErrorResponse("Slug already in use", 400));
    }
  }

  // ✅ Handle bgImage upload
  if (req.files?.bgImageFile) {
    const file = req.files.bgImageFile;
    const uploadDir = ensureUploadDir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath);

    req.body.bgImage = {
      url: `/uploads/maincategory/${fileName}`,
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

// ✅ DELETE
exports.deleteMainCategory = asyncHandler(async (req, res, next) => {
  const mainCategory = await MainCategory.findByIdAndDelete(req.params.id);
  if (!mainCategory) {
    return next(new ErrorResponse("Main category not found", 404));
  }
  res.status(200).json({ success: true, data: {} });
});
