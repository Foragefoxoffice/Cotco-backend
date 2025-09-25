const Section = require("../models/Section");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc Create section type
exports.createSection = asyncHandler(async (req, res) => {
  const section = await Section.create(req.body);
  res.status(201).json({ success: true, data: section });
});

// @desc Get all section types
exports.getSections = asyncHandler(async (req, res) => {
  const sections = await Section.find();
  res.status(200).json({ success: true, count: sections.length, data: sections });
});

// @desc Get single section type
exports.getSection = asyncHandler(async (req, res, next) => {
  const section = await Section.findById(req.params.id);
  if (!section) return next(new ErrorResponse("Section not found", 404));
  res.status(200).json({ success: true, data: section });
});

// @desc Update section type
exports.updateSection = asyncHandler(async (req, res, next) => {
  const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!section) return next(new ErrorResponse("Section not found", 404));
  res.status(200).json({ success: true, data: section });
});

// @desc Delete section type
exports.deleteSection = asyncHandler(async (req, res, next) => {
  const section = await Section.findByIdAndDelete(req.params.id);
  if (!section) return next(new ErrorResponse("Section not found", 404));
  res.status(200).json({ success: true, data: {} });
});
