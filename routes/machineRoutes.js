const express = require("express");
const router = express.Router();

const {
  // Machine Category
  createMachineCategory,
  getMachineCategories,
  getMachineCategory,
  updateMachineCategory,
  deleteMachineCategory,

  // Section
  createMachineSection,
  getMachineSections,
  getMachineSection,
  updateMachineSection,
  deleteMachineSection,

  // Page
  createMachinePage,
  getMachinePages,
  getMachinePage,
  updateMachinePage,
  deleteMachinePage,
  getMachinePagesByCategorySlug,
} = require("../controllers/machineController");

/* =========================================================
   MACHINE CATEGORY ROUTES
========================================================= */
router.post("/categories", createMachineCategory);
router.get("/categories", getMachineCategories);
router.get("/categories/:id", getMachineCategory);
router.put("/categories/:id", updateMachineCategory);
router.delete("/categories/:id", deleteMachineCategory);

/* =========================================================
   MACHINE SECTION ROUTES
========================================================= */
router.post("/sections", createMachineSection);
router.get("/sections", getMachineSections);
router.get("/sections/:id", getMachineSection);
router.post("/pages/:id", updateMachinePage); // for multipart update
router.put("/pages/:id", updateMachinePage);  // for JSON-only update

router.delete("/sections/:id", deleteMachineSection);

/* =========================================================
   MACHINE PAGE ROUTES
========================================================= */
router.post("/pages", createMachinePage);
router.get("/pages", getMachinePages);
router.get("/pages/:slug", getMachinePage);
router.put("/pages/:id", updateMachinePage);
router.delete("/pages/:id", deleteMachinePage);

// ✅ Only by categorySlug now (no mainCategorySlug)
router.get("/pages/category/:categorySlug", getMachinePagesByCategorySlug);

module.exports = router;
