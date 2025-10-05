const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactEnrtriesController");

router.get("/", contactController.getContacts);
router.post("/", contactController.createContact);
router.delete("/:id", contactController.deleteContact);

module.exports = router;
