const Blog = require("../models/Blog");
const Category = require("../models/Category");

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
      .populate("mainCategory", "name")
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
/**
 * @desc    Get single blog by slug
 * @route   GET /api/blogs/:slug
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    console.log("🔎 Searching for slug:", req.params.slug);

    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email")
      .populate("category", "name slug")
      .populate("mainCategory", "name slug");

    console.log("✅ Found:", blog ? blog._id : "Not found");

    if (!blog)
      return res.status(404).json({ success: false, error: "Blog not found" });

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
    const now = new Date();

    data.createdAt = data.createdAt || now;
    data.updatedAt = now;

    // ✅ If status = "published" but no publishedAt, assign it
    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = now;
    }

    // ✅ Ensure "Common" category exists and assign it if missing
    if (!data.category) {
      let defaultCat = await Category.findOne({
        $or: [{ "name.en": "Common" }, { "name.vi": "Chung" }],
      });

      // ✅ Auto-create Common category if it doesn't exist
      if (!defaultCat) {
        console.log("⚠️ Common category not found — creating one automatically...");
        defaultCat = await Category.create({
          name: { en: "Common", vi: "Chung" },
          slug: "common",
          mainCategory: data.mainCategory || undefined,
        });
      }

      data.category = defaultCat._id;
    }

    // ✅ Create and save the blog
    const blog = new Blog(data);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate("author", "name email")
      .populate("category", "name slug")
.populate("mainCategory", "name slug")

    res.status(201).json({ success: true, data: populatedBlog });
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
    const updates = req.body;
    updates.updatedAt = new Date();

    // ✅ Auto-set publishedAt if switched to published and missing
    if (updates.status === "published" && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }

    // ✅ Ensure category is never empty (auto-create Common if needed)
    if (!updates.category) {
      let defaultCat = await Category.findOne({
        $or: [{ "name.en": "Common" }, { "name.vi": "Chung" }],
      });

      if (!defaultCat) {
        console.log("⚠️ Common category not found during update — creating one...");
        defaultCat = await Category.create({
          name: { en: "Common", vi: "Chung" },
          slug: "common",
          mainCategory: updates.mainCategory || undefined,
        });
      }

      updates.category = defaultCat._id;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("mainCategory", "name")
      .populate("author", "name email");

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
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ success: false, error: "Invalid blog ID" });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
