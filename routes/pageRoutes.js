const express = require("express");
const {
  createPage, getPages, getPageBySlug, updatePage, deletePage
} = require("../controllers/pageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/")
  .post(protect, createPage)
  .get(getPages);

router.route("/:slug").get(getPageBySlug);

router.route("/:id")
  .put(protect, updatePage)
  .delete(protect, deletePage);

module.exports = router;
