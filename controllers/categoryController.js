const Category = require("../models/Category");
const Blog = require("../models/Blog"); // ✅ Make sure this path is correct
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

  // ✅ Ensure both language objects exist
  if (!req.body.name) req.body.name = {};
  if (!req.body.name.en) req.body.name.en = "";
  if (!req.body.name.vi) req.body.name.vi = "";

  // ✅ Check duplicate EN name
  const existingByName = await Category.findOne({
    "name.en": req.body.name.en.trim(),
  });
  if (existingByName) {
    return next(new ErrorResponse("Category name already exists", 400));
  }

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
  const categories = await Category.find().populate("mainCategory", "name slug");
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
  const category = await Category.findById(req.params.id).populate(
    "mainCategory",
    "name slug"
  );
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }
  res.status(200).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  if (req.body._id) delete req.body._id;

  // ✅ If name is changing, check duplicates
  if (req.body.name?.en || req.body.name?.vi) {
    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { "name.en": req.body.name?.en?.trim() },
        { "name.vi": req.body.name?.vi?.trim() },
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
  }).populate("mainCategory", "name slug");

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  res.status(200).json({ success: true, data: category });
});

// @desc    Delete category and reassign related blogs to "Common"
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId || categoryId === "undefined") {
      return next(new ErrorResponse("Invalid category ID", 400));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new ErrorResponse("Category not found", 404));
    }

    // 🧠 Prevent deletion of the default "Common" category
    const catNameEn = category.name?.en?.toLowerCase();
    const catNameVi = category.name?.vi?.toLowerCase();
    if (catNameEn === "common" || catNameVi === "chung") {
      return next(
        new ErrorResponse(
          "Cannot delete the default 'Common' category. It is used as a fallback.",
          400
        )
      );
    }

    // ✅ Ensure "Common" category exists
    let commonCategory = await Category.findOne({
      $or: [{ "name.en": "Common" }, { "name.vi": "Chung" }],
    });

    if (!commonCategory) {
      console.log("⚠️ Common category not found — creating automatically...");
      commonCategory = await Category.create({
        name: { en: "Common", vi: "Chung" },
        slug: "common",
        mainCategory: category.mainCategory || undefined,
      });
    }

    // ✅ Step 1: Move all blogs using this category to "Common" and set draft
    const result = await Blog.updateMany(
      { category: categoryId },
      {
        $set: {
          category: commonCategory._id,
          status: "draft",
        },
      }
    );

    console.log(`📝 Updated ${result.modifiedCount} blogs to draft.`);

    // ✅ Step 2: Delete the category
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: `Category deleted successfully. ${result.modifiedCount} blog(s) moved to 'Common' and set to draft.`,
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return next(new ErrorResponse(error.message || "Server error", 500));
  }
});
