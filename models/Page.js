const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  sectionType: { type: String, required: true },
  values: {
    type: Object, // Example: { title: { en: "Hello", vn: "Xin chào" } }
    required: true
  },
  position: { type: Number, default: 0 }
});

const pageSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  title: {
    en: { type: String, required: true },
    vn: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true, trim: true },
  blocks: [blockSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

pageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Page", pageSchema);
