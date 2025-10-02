const express = require("express");
const { getContactPage, updateContactPage } = require("../controllers/contactController");
const router = express.Router();

router.get("/", getContactPage);
router.post("/", updateContactPage);

module.exports = router;
