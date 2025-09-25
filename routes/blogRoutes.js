const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// GET all blogs (with optional filters)
router.get("/", blogController.getBlogs);

// GET single blog by slug
router.get("/:slug", blogController.getBlogBySlug);

// CREATE blog
router.post("/", blogController.createBlog);

// UPDATE blog
router.put("/:id", blogController.updateBlog);

// DELETE blog
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
