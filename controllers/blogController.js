const Blog = require("../models/Blog");

/**
 * @desc    Get all blogs (with optional filters)
 * @route   GET /api/blogs
 */
exports.getBlogs = async (req, res) => {
  try {
    const { status, category, tag, author } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (tag) query.tags = tag;

    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .populate("category", "name")
      .populate("mainCategory")
      .sort({ publishedAt: -1 });

    res.json({ success: true, data: blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * @desc    Get single blog by slug
 * @route   GET /api/blogs/:slug
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .populate("category", "name");

    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

/**
 * @desc    Create a blog
 * @route   POST /api/blogs
 */
exports.createBlog = async (req, res) => {
  try {
    const data = req.body;

    // ✅ Always ensure timestamps
    const now = new Date();

    data.createdAt = data.createdAt || now;
    data.publishedAt = now; // force unique recency
    data.updatedAt = now;

    // Even if it's a draft, keep publishedAt for sorting
    const blog = new Blog(data);
    await blog.save();

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Update a blog
 * @route   PUT /api/blogs/:id
 */
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete a blog
 * @route   DELETE /api/blogs/:id
 */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
