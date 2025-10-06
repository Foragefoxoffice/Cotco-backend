const express = require("express");
const {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");
const { protect } = require("../middleware/auth"); // ✅ Import your auth middleware

const router = express.Router();

// Public routes (optional)
router.get("/", getRoles);
router.get("/:id", getRole);

// Protected routes (only logged-in users can modify)
router.post("/", protect, createRole);
router.put("/:id", protect, updateRole);
router.delete("/:id", protect, deleteRole);

module.exports = router;
