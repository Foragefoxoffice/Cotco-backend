const mongoose = require("mongoose");

const headerSchema = new mongoose.Schema(
  {
    headerLogo: { type: String, default: "" }, // ✅ only logo
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.HeaderPage ||
  mongoose.model("HeaderPage", headerSchema);
