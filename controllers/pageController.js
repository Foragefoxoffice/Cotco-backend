const Page = require("../models/Page");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");

/* ---------- Helper: process sections and replace placeholders ---------- */
const processSections = (sections, files = []) => {
  if (!Array.isArray(sections)) return sections;

  return sections.map((s) => {
    if (["image", "imageLeft", "imageRight"].includes(s.type)) {
      const file = files.find((f) => f.fieldname === s.image);

      if (file) {
        s.image = `/uploads/pages/${file.filename}`;
      } else if (
        s.image &&
        !s.image.startsWith("/uploads/") &&
        !s.image.startsWith("http")
      ) {
        s.image = null;
      }
    }

    if (s.tabs && Array.isArray(s.tabs)) {
      s.tabs = s.tabs.map((tab) => ({
        ...tab,
        sections: processSections(tab.sections || [], files),
      }));
    }

    return s;
  });
};

/* ---------- CREATE PAGE ---------- */
exports.createPage = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (body.title) body.title = JSON.parse(body.title);
  if (body.description) body.description = JSON.parse(body.description);
  if (body.seo) body.seo = JSON.parse(body.seo);
  if (body.sections) body.sections = JSON.parse(body.sections);

  // ✅ Banner
  if (req.files?.banner?.[0]) {
    body.banner = `/uploads/pages/${path.basename(req.files.banner[0].path)}`;
  }

  // ✅ Sections
  if (body.sections) {
    body.sections = processSections(
      body.sections,
      Array.isArray(req.files) ? req.files : Object.values(req.files).flat()
    );
  }

  const page = await Page.create({ ...body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: page });
});

/* ---------- GET ALL PAGES ---------- */
exports.getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().populate("category createdBy", "name email");
  res.status(200).json({ success: true, count: pages.length, data: pages });
});

/* ---------- GET PAGE BY SLUG ---------- */
exports.getPageBySlug = asyncHandler(async (req, res, next) => {
  const page = await Page.findOne({ slug: req.params.slug }).populate(
    "category createdBy",
    "name email"
  );
  if (!page) return next(new ErrorResponse("Page not found", 404));
  res.status(200).json({ success: true, data: page });
});

/* ---------- UPDATE PAGE ---------- */
exports.updatePage = asyncHandler(async (req, res, next) => {
  try {
    let body = { ...req.body };

    if (body.title && typeof body.title === "string")
      body.title = JSON.parse(body.title);
    if (body.description && typeof body.description === "string")
      body.description = JSON.parse(body.description);
    if (body.seo && typeof body.seo === "string")
      body.seo = JSON.parse(body.seo);
    if (body.sections && typeof body.sections === "string")
      body.sections = JSON.parse(body.sections);

    // ✅ Sections
    if (body.sections) {
      body.sections = processSections(body.sections, req.files);
    }

    // ✅ Banner (multer.fields gives req.files.banner = [file])
    if (req.files?.banner?.[0]) {
      body.banner = `/uploads/pages/${path.basename(req.files.banner[0].path)}`;
    }

    const page = await Page.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!page) return next(new ErrorResponse("Page not found", 404));
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.slug) {
      return next(
        new ErrorResponse("Slug already exists, please choose another one", 400)
      );
    }
    next(err);
  }
});

/* ---------- DELETE PAGE ---------- */
exports.deletePage = asyncHandler(async (req, res, next) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) return next(new ErrorResponse("Page not found", 404));
  res.status(200).json({ success: true, data: {} });
});
