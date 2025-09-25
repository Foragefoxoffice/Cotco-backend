const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // hero, content, gallery
  fields: [
    {
      key: { type: String, required: true },   // e.g. "title"
      type: { type: String, required: true }   // "multilang", "image", "array"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Section", sectionSchema);
