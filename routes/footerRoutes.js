const express = require("express");
const { getFooterPage, updateFooterPage } = require("../controllers/footerController");
const router = express.Router();

router.get("/", getFooterPage);
router.post("/", updateFooterPage);

module.exports = router;
