const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    company: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format"],
    },
    phone: { type: String, required: true },
    product: {
      type: String,
      required: true,
      enum: ["cotton", "viscose", "machinery"],
    },
    message: { type: String, required: true, minlength: 20 },
    fileUrl: { type: String }, // uploaded file path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
