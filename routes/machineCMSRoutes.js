const express = require("express");
const router = express.Router();
const {
  getMachineCMSPage,
  updateMachineCMSPage,
} = require("../controllers/machineCMSController");

router.get("/", getMachineCMSPage);
router.post("/", updateMachineCMSPage);

module.exports = router;
