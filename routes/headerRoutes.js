const express = require("express");
const { getHeaderPage, updateHeaderPage } = require("../controllers/headerController");
const router = express.Router();

router.get("/", getHeaderPage);
router.post("/", updateHeaderPage);

module.exports = router;
