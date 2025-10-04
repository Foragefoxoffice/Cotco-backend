const express = require("express");
const { getPrivacyPage, updatePrivacyPage } = require("../controllers/privacyController");
const router = express.Router();

router.get("/", getPrivacyPage);
router.post("/", updatePrivacyPage);

module.exports = router;
