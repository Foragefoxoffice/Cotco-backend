const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    // ✅ Multilingual name field
    name: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },

    // ✅ Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ Full permission map (aligned with Sidebar.jsx & RoleManagement.jsx)
    permissions: {
      // Dashboard
      dashboard: { type: Boolean, default: false },

      // Resources
      resources: { type: Boolean, default: false },
      maincategories: { type: Boolean, default: false },
      categories: { type: Boolean, default: false },

      // Machines
      machines: { type: Boolean, default: false },
      machineCategories: { type: Boolean, default: false },
      machineList: { type: Boolean, default: false },

      // CMS
      cms: { type: Boolean, default: false },
      header: { type: Boolean, default: false },
      footer: { type: Boolean, default: false },
      home: { type: Boolean, default: false },
      about: { type: Boolean, default: false },
      cotton: { type: Boolean, default: false },
      fiber: { type: Boolean, default: false },
      contact: { type: Boolean, default: false },
      privacy: { type: Boolean, default: false },
      terms: { type: Boolean, default: false },

      // User management
      users: { type: Boolean, default: false },
      roles: { type: Boolean, default: false },
      staff: { type: Boolean, default: false },

      // Enquiry
      enquiry: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
