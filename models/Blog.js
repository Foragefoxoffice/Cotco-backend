const mongoose = require("mongoose");
const blockSchema = require("./Block");

const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    vn: { type: String, required: true },
  },
  slug: { type: String, required: true, unique: true, trim: true },
  excerpt: {
    en: { type: String },
    vn: { type: String },
  },
  coverImage: {
    url: { type: String },
    alt: { type: String },
  },
  blocks: [
    {
      type: { type: String, required: true }, // richtext, image, list, etc.
      content: { type: Object, required: true },
      position: { type: Number, default: 0 },
    },
  ],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  author: { type: String },
  category: { type: String, required: true },
  tags: [String],
  seo: {
    title: { en: String, vn: String },
    description: { en: String, vn: String },
  },
  publishedAt: { type: Date, default: Date.now },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
