const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    vi: { type: String, required: true },
  },
  slug: { type: String, required: true, unique: true, trim: true },

  excerpt: {
    en: { type: String },
    vi: { type: String },
  },

  coverImage: {
    url: { type: String },
    alt: { type: String },
  },

  blocks: [
    {
      type: { type: String, required: true },
      content: { type: Object, required: true },
      position: { type: Number, default: 0 },
    },
  ],

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },

  author: { type: String, trim: true },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory",
    required: true,
  },

  tags: [String],

  seo: {
    title: { en: String, vi: String },
    description: { en: String, vi: String },
    keywords: { en: String, vi: String },
  },

  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

//
// ✅ Auto timestamp, publish logic, and default category
//
blogSchema.pre("save", async function (next) {
  try {
    this.updatedAt = Date.now();

    // Auto-assign publishedAt only when status = "published"
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = Date.now();
    }

    // Ensure publishedAt exists even for drafts (useful for sorting)
    if (!this.publishedAt) {
      this.publishedAt = this.createdAt || Date.now();
    }

    // ✅ Auto-assign "Common" category if not provided
    if (!this.category) {
      const Category = mongoose.model("Category");

      // Try to find existing Common category
      let defaultCat = await Category.findOne({
        $or: [{ "name.en": "Common" }, { "name.vi": "Chung" }],
      });

      // If not found, auto-create it
      if (!defaultCat) {
        console.log("⚠️ Common category not found — creating automatically...");
        defaultCat = await Category.create({
          name: { en: "Common", vi: "Chung" },
          slug: "common",
          mainCategory: this.mainCategory || undefined,
        });
      }

      this.category = defaultCat._id;
    }

    next();
  } catch (error) {
    console.error("Error in blog pre-save hook:", error);
    next(error);
  }
});

module.exports = mongoose.model("Blog", blogSchema);
