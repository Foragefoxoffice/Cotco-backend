const express = require("express");
const {
  createSection, getSections, getSection, updateSection, deleteSection
} = require("../controllers/sectionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/")
  .post(protect, createSection)
  .get(getSections);

router.route("/:id")
  .get(getSection)
  .put(protect, updateSection)
  .delete(protect, deleteSection);

module.exports = router;
