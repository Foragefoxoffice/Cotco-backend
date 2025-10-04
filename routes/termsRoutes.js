const express = require("express");
const { getTermsPage, updateTermsPage } = require("../controllers/termsController");
const router = express.Router();

router.get("/", getTermsPage);
router.post("/", updateTermsPage);

module.exports = router;
