const express = require("express");
const router = express.Router();
const {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

// ROLE CRUD ROUTES
router.post("/", createRole);       
router.get("/", getRoles);         
router.get("/:id", getRole);      
router.put("/:id", updateRole);    
router.delete("/:id", deleteRole);  

module.exports = router;
