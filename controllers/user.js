const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Role = require("../models/role");

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .populate("role", "name permissions") // ✅ Populate role name + permissions
    .select("-password"); // hide password

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // 🧠 Normalize status value (capitalize)
  if (req.body.status) {
    req.body.status =
      req.body.status.charAt(0).toUpperCase() +
      req.body.status.slice(1).toLowerCase();
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // 🧠 Normalize status value (capitalize)
  if (req.body.status) {
    req.body.status =
      req.body.status.charAt(0).toUpperCase() +
      req.body.status.slice(1).toLowerCase();
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
/* =========================================================
   DELETE USER (Only Super Admin can delete)
========================================================= */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // ✅ Get current user with populated role (from middleware)
  const requestingUser = req.user;

  if (!requestingUser) {
    return next(new ErrorResponse("Requesting user not found ❌", 404));
  }

 // ✅ Normalize bilingual + case-insensitive
const requesterRoleName = (
  typeof requestingUser.role?.name === "object"
    ? requestingUser.role?.name.en || requestingUser.role?.name.vi
    : requestingUser.role?.name
)?.toLowerCase();

  // ✅ Only Super Admin can delete
if (requesterRoleName?.toLowerCase() !== "super admin") {
  console.log("🧩 Requester (not super admin):", {
    userId: req.user._id,
    role: req.user.role,
    requesterRoleName,
  });
  return next(new ErrorResponse("Only Super Admin can delete users ❌", 403));

  }

  // ✅ Find the target user
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found ❌", 404));
  }

  // ✅ Check target user’s role
  const targetRole = await Role.findById(user.role);
  const targetRoleName =
    typeof targetRole?.name === "object"
      ? targetRole.name.en || targetRole.name.vi
      : targetRole?.name;

  if (targetRoleName?.toLowerCase() === "super admin") {
    return next(new ErrorResponse("Cannot delete Super Admin ❌", 403));
  }

  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User deleted successfully ✅",
  });
});
