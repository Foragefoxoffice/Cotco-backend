const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    footerLogo: { type: String, default: "" },

    footerSocials: [
      {
        iconImage: { type: String, default: "" },  // 👈 path to uploaded image
        link: { type: String, default: "" },       // 👈 social link
      },
    ],

    copyrights: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FooterPage ||
  mongoose.model("FooterPage", footerSchema);
