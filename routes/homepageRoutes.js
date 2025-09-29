const express = require("express");
const {
  getHomepage,
  updateHomepage,
} = require("../controllers/homepageController");
const router = express.Router();

router.get("/", getHomepage);
router.post("/", updateHomepage);

module.exports = router;
