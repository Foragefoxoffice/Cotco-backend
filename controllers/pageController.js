const Page = require("../models/Page");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc Create page
// exports.createPage = asyncHandler(async (req, res) => {
//   const page = await Page.create({ ...req.body, createdBy: req.user.id });
//   res.status(201).json({ success: true, data: page });
// });

exports.createPage = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (body.title) body.title = JSON.parse(body.title);
  if (body.description) body.description = JSON.parse(body.description);
  if (body.seo) body.seo = JSON.parse(body.seo);
  if (body.sections) body.sections = JSON.parse(body.sections);

  // ✅ Replace placeholder with uploaded file paths
  if (req.files) {
    body.sections = body.sections.map((s) => {
      if ((s.type === "imageLeft" || s.type === "imageRight") && s.image && req.files[s.image]) {
        s.image = `/uploads/${req.files[s.image][0].filename}`; // adjust path as per your multer config
      }
      return s;
    });
  }

  const page = await Page.create({ ...body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: page });
});


// @desc Get all pages
exports.getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().populate("category createdBy", "name email");
  res.status(200).json({ success: true, count: pages.length, data: pages });
});

// @desc Get page by slug
exports.getPageBySlug = asyncHandler(async (req, res, next) => {
  const page = await Page.findOne({ slug: req.params.slug }).populate("category createdBy", "name email");
  if (!page) return next(new ErrorResponse("Page not found", 404));
  res.status(200).json({ success: true, data: page });
});

// @desc Update page
exports.updatePage = asyncHandler(async (req, res, next) => {
  const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!page) return next(new ErrorResponse("Page not found", 404));
  res.status(200).json({ success: true, data: page });
});

// @desc Delete page
exports.deletePage = asyncHandler(async (req, res, next) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) return next(new ErrorResponse("Page not found", 404));
  res.status(200).json({ success: true, data: {} });
});
