const Role = require("../models/role");

/** ---------- CREATE ROLE ---------- */
exports.createRole = async (req, res) => {
  try {
    const { name, status, permissions } = req.body;

    const role = new Role({
      name,
      status,
      permissions,
    });

    await role.save();
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/** ---------- GET ALL ROLES ---------- */
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** ---------- GET SINGLE ROLE ---------- */
exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, error: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/** ---------- UPDATE ROLE ---------- */
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!role) return res.status(404).json({ success: false, error: "Role not found" });

    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/** ---------- DELETE ROLE ---------- */
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ success: false, error: "Role not found" });

    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
