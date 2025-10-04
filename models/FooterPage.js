const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    footerLogo: { type: String, default: "" }, // ✅ file path for logo
    footerSocials: [
      {
        icon: { type: String, required: true }, // lucide-react icon name
        link: { type: String, required: true }, // social media link
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FooterPage ||
  mongoose.model("FooterPage", footerSchema);
