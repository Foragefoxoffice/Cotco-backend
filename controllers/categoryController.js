// controllers/categoryController.js
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) {
    delete req.body._id;
  }

  // ✅ Ensure both language objects exist
  if (!req.body.name) req.body.name = {};
  if (!req.body.name.en) req.body.name.en = "";
  if (!req.body.name.vn) req.body.name.vn = "";

  const existingByName = await Category.findOne({
    "name.en": req.body.name.en.trim(),
  });

  // ✅ Ensure slug uniqueness
  let slug = req.body.slug.trim();
  let existingSlug = await Category.findOne({ slug });
  let counter = 1;

  while (existingSlug) {
    slug = `${req.body.slug}-${counter}`;
    existingSlug = await Category.findOne({ slug });
    counter++;
  }

  req.body.slug = slug;

  const category = await Category.create(req.body);

  res.status(201).json({ success: true, data: category });
});

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) {
    delete req.body._id;
  }

  // ✅ If name is changing, check duplicates
  if (req.body.name?.en || req.body.name?.vn) {
    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { "name.en": req.body.name?.en?.trim() },
        { "name.vn": req.body.name?.vn?.trim() },
      ],
    });
    if (duplicate) {
      return next(
        new ErrorResponse("Another category with this name already exists", 400)
      );
    }
  }

  // ✅ If slug is changing, check duplicates
  if (req.body.slug) {
    const duplicateSlug = await Category.findOne({
      _id: { $ne: req.params.id },
      slug: req.body.slug.trim(),
    });
    if (duplicateSlug) {
      return next(new ErrorResponse("Slug already in use", 400));
    }
  }

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  res.status(200).json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  res.status(200).json({ success: true, data: {} });
});
