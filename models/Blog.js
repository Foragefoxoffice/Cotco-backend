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
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  author: { type: String },

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
  },

  // ✅ Fixed fields
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Automatically set timestamps properly
blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // If publishing a new blog or switching to published
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  // Fallback: ensure publishedAt exists even for drafts (helps sorting)
  if (!this.publishedAt) {
    this.publishedAt = this.createdAt || Date.now();
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
