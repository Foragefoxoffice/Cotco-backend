const express = require("express");
const { getCottonPage, updateCottonPage } = require("../controllers/cottonController");
const router = express.Router();

router.get("/", getCottonPage);
router.post("/", updateCottonPage);

module.exports = router;
