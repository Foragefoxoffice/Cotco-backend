const Role = require("../models/role");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

/** ---------- CREATE ROLE ---------- */
exports.createRole = asyncHandler(async (req, res, next) => {
  const { name, status, permissions } = req.body;

  // Prevent creating another Super Admin
  if (name === "Super Admin") {
    return next(
      new ErrorResponse("You cannot create another Super Admin role ❌", 403)
    );
  }

  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    return next(
      new ErrorResponse("A role with this name already exists ❌", 400)
    );
  }

  const role = new Role({
    name,
    status,
    permissions,
  });

  await role.save();
  res.status(201).json({ success: true, data: role });
});

/** ---------- GET ALL ROLES ---------- */
exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.status(200).json({ success: true, data: roles });
});

/** ---------- GET SINGLE ROLE ---------- */
exports.getRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  if (!role) return next(new ErrorResponse("Role not found ❌", 404));

  res.status(200).json({ success: true, data: role });
});

/** ---------- UPDATE ROLE (Super Admin only) ---------- */
exports.updateRole = asyncHandler(async (req, res, next) => {
  const requestingUser = await User.findById(req.user.id).populate("role");

  // ✅ Only Super Admin can edit roles
  if (requestingUser.role?.name !== "Super Admin") {
    return next(new ErrorResponse("Only Super Admin can edit roles ❌", 403));
  }

  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new ErrorResponse("Role not found ❌", 404));
  }

  // Prevent editing the Super Admin role
  if (role.name === "Super Admin") {
    return next(
      new ErrorResponse("You cannot modify the Super Admin role ❌", 403)
    );
  }

  const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updatedRole });
});

/** ---------- DELETE ROLE (Super Admin only) ---------- */
exports.deleteRole = asyncHandler(async (req, res, next) => {
  const requestingUser = await User.findById(req.user.id).populate("role");

  // ✅ Only Super Admin can delete roles
  if (requestingUser.role?.name !== "Super Admin") {
    return next(new ErrorResponse("Only Super Admin can delete roles ❌", 403));
  }

  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(
      new ErrorResponse(`Role not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deleting Super Admin role itself
  if (role.name === "Super Admin") {
    return next(
      new ErrorResponse("Cannot delete the Super Admin role ❌", 403)
    );
  }

  // ✅ Prevent deleting a role if it's assigned to any user
  const usersWithRole = await User.find({ role: role._id });
  if (usersWithRole.length > 0) {
    return next(
      new ErrorResponse(
        "Cannot delete this role because it is assigned to users ❌",
        400
      )
    );
  }

  await role.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: "Role deleted successfully ✅",
  });
});
