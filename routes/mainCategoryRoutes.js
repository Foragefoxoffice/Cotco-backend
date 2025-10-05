const express = require("express");
const {
  createMainCategory,
  getMainCategories,
  getMainCategory,
  updateMainCategory,
  deleteMainCategory,
} = require("../controllers/mainCategoryController");

const router = express.Router();

router.route("/")
  .post(createMainCategory)
  .get(getMainCategories);

router.route("/:id")
  .get(getMainCategory)
  .put(updateMainCategory)
  .delete(deleteMainCategory);

module.exports = router;
