const express = require("express");
const {
  createPage,
  getPages,
  getPageBySlug,
  updatePage,
  deletePage,
} = require("../controllers/pageController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload"); // ✅ import multer config

const router = express.Router();

// ---------- ROUTES ----------

// ✅ Create page with banner + section images
router
  .route("/")
  .post(protect, upload.any(), createPage) // <-- add upload.any()
  .get(getPages);

// ✅ Get page by slug (public)
router.route("/:slug").get(getPageBySlug);

// ✅ Update page with banner + section images
router
  .route("/:id")
  .put(protect, upload.any(), updatePage) // <-- add upload.any()
  .delete(protect, deletePage);

module.exports = router;
