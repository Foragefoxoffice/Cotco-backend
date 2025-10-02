const express = require("express");
const {
  getFiberPage,
  updateFiberPage,
} = require("../controllers/fiberController");
const router = express.Router();

router.get("/", getFiberPage);
router.post("/", updateFiberPage);

module.exports = router;
