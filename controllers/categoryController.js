const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc Create category
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// @desc Get all categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc Get single category
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorResponse("Category not found", 404));
  res.status(200).json({ success: true, data: category });
});

// @desc Update category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!category) return next(new ErrorResponse("Category not found", 404));
  res.status(200).json({ success: true, data: category });
});

// @desc Delete category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new ErrorResponse("Category not found", 404));
  res.status(200).json({ success: true, data: {} });
});
