const express = require("express");
const router = express.Router();

const {
  // Main Category
  createMainCategory,
  getMainCategories,
  getMainCategory,
  updateMainCategory,
  deleteMainCategory,

  // Machine Category
  createMachineCategory,
  getMachineCategories,
  getMachineCategory,
  updateMachineCategory,
  deleteMachineCategory,
getMachineCategoriesByMainCategorySlug,
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
  getMachinePagesByMainCategorySlug,
  getMachinePagesByCategorySlug
} = require("../controllers/machineController");

/* =========================================================
   MAIN CATEGORY ROUTES
========================================================= */
router.post("/maincategories", createMainCategory);
router.get("/maincategories", getMainCategories);
router.get("/maincategories/:id", getMainCategory);
router.put("/maincategories/:id", updateMainCategory);
router.delete("/maincategories/:id", deleteMainCategory);

/* =========================================================
   MACHINE CATEGORY ROUTES
========================================================= */
router.post("/categories", createMachineCategory);
router.get("/categories", getMachineCategories);
router.get("/categories/:id", getMachineCategory);
router.put("/categories/:id", updateMachineCategory);
router.delete("/categories/:id", deleteMachineCategory);
router.get(
  "/categories/main-category/:mainCategorySlug",
  getMachineCategoriesByMainCategorySlug
);

/* =========================================================
   MACHINE SECTION ROUTES
========================================================= */
router.post("/sections", createMachineSection);
router.get("/sections", getMachineSections);
router.get("/sections/:id", getMachineSection);
router.put("/sections/:id", updateMachineSection);
router.delete("/sections/:id", deleteMachineSection);

/* =========================================================
   MACHINE PAGE ROUTES
========================================================= */
router.post("/pages", createMachinePage);
router.get("/pages", getMachinePages);
router.get("/pages/:slug", getMachinePage);
router.put("/pages/:id", updateMachinePage);
router.delete("/pages/:id", deleteMachinePage);
router.get("/pages/category/:categorySlug", getMachinePagesByCategorySlug);
router.get("/pages/main-category/:mainCategorySlug", getMachinePagesByMainCategorySlug);

module.exports = router;
