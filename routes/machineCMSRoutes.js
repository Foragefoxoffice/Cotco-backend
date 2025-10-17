const express = require("express");
const router = express.Router();
const {
  getMachineCMSPage,
  updateMachineCMSPage,
} = require("../controllers/machineCMSController");

// ✅ Must match the request methods
router.get("/", getMachineCMSPage);
router.post("/", updateMachineCMSPage); // <-- make sure it's POST, not PUT

module.exports = router;
