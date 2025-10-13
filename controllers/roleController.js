const Role = require("../models/role");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

/** ---------- CREATE ROLE ---------- */
exports.createRole = asyncHandler(async (req, res, next) => {
  const { name, status, permissions } = req.body;

  // ✅ Validate bilingual name
  if (!name?.en || !name?.vi) {
    return next(new ErrorResponse("Both English and Vietnamese names are required ❌", 400));
  }

  // ✅ Prevent creating another Super Admin
  if (name.en === "Super Admin" || name.vi === "Quản trị viên cao cấp") {
    return next(new ErrorResponse("You cannot create another Super Admin role ❌", 403));
  }

  // ✅ Check for duplicate (in either language)
  const existingRole = await Role.findOne({
    $or: [{ "name.en": name.en }, { "name.vi": name.vi }],
  });
  if (existingRole) {
    return next(new ErrorResponse("A role with this name already exists ❌", 400));
  }

  // ✅ Create role
  const role = await Role.create({
    name,
    status,
    permissions,
  });

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
  if (requestingUser.role?.name?.en !== "Super Admin") {
    return next(new ErrorResponse("Only Super Admin can edit roles ❌", 403));
  }

  const role = await Role.findById(req.params.id);
  if (!role) return next(new ErrorResponse("Role not found ❌", 404));

  // ✅ Prevent editing the Super Admin role
  if (role.name?.en === "Super Admin" || role.name?.vi === "Quản trị viên cao cấp") {
    return next(new ErrorResponse("You cannot modify the Super Admin role ❌", 403));
  }

  // ✅ Validate bilingual name on update
  if (req.body.name && (!req.body.name.en || !req.body.name.vi)) {
    return next(new ErrorResponse("Both English and Vietnamese names are required ❌", 400));
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

  // 🧠 Handle bilingual role names
  let roleName = requestingUser.role?.name;
  if (typeof roleName === "object") {
    roleName = roleName.en || roleName.vi;
  }

  // ✅ Only Super Admin can delete roles
  if (roleName !== "Super Admin") {
    return next(new ErrorResponse("Only Super Admin can delete roles ❌", 403));
  }

  const role = await Role.findById(req.params.id);
  if (!role) return next(new ErrorResponse("Role not found ❌", 404));

  // ✅ Prevent deleting the Super Admin role
  if (
    role.name?.en === "Super Admin" ||
    role.name?.vi === "Quản trị viên cao cấp"
  ) {
    return next(new ErrorResponse("Cannot delete the Super Admin role ❌", 403));
  }

  // ✅ Prevent deleting a role assigned to users
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
    message: "Role deleted successfully ✅",
  });
});
