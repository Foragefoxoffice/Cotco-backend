const express = require("express");
const {
  getAboutPage,
  updateAboutPage,
} = require("../controllers/aboutController");
const router = express.Router();

router.get("/", getAboutPage);
router.post("/", updateAboutPage);

module.exports = router;
