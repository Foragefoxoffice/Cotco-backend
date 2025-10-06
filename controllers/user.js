const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

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
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const requestingUser = await User.findById(req.user.id).populate("role");

  // ✅ Only Super Admin can delete users
  if (requestingUser.role?.name !== "Super Admin") {
    return next(new ErrorResponse("Only Super Admin can delete users ❌", 403));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent Super Admin from deleting themselves
  if (user.role?.name === "Super Admin") {
    return next(
      new ErrorResponse("You cannot delete the Super Admin account ❌", 403)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: "User deleted successfully ✅",
  });
});
