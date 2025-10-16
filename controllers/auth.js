const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Role = require("../models/role");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

/* =========================================================
   REGISTER USER
========================================================= */
// @desc    Register user (admin assigns role)
// @route   POST /api/v1/auth/register
// @access  Private (Admin/with permission)
exports.register = asyncHandler(async (req, res, next) => {
  const {
    employeeId,
    firstName,
    middleName,
    lastName,
    department,
    designation,
    email,
    phone,
    roleId,
    gender,
    dateOfBirth,
    dateOfJoining,
  } = req.body;

  // 🔍 Check for existing user
  if (await User.findOne({ email })) {
    return next(new ErrorResponse("User already exists", 400));
  }

  // 🔍 Validate role
  const role = await Role.findById(roleId);
  if (!role) return next(new ErrorResponse("Invalid role ID", 400));

  // ✅ Generate random password
  const rawPassword = `${firstName?.en?.toLowerCase() || "user"}@${
    Math.floor(1000 + Math.random() * 9000)
  }`;

  // ✅ Optional profile upload
  let profileImage = null;
  if (req.files && req.files.profileImage) {
    const file = req.files.profileImage;
    const uploadDir = path.join(__dirname, "../uploads/profile/");
    fs.mkdirSync(uploadDir, { recursive: true });
    const fileName = Date.now() + "-" + file.name;
    const uploadPath = path.join(uploadDir, fileName);
    await file.mv(uploadPath);
    profileImage = `/uploads/profile/${fileName}`;
  }

  // ✅ Create user (now includes gender, DOB, DOJ)
  const user = await User.create({
    employeeId,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    role: role._id,
    password: rawPassword,
    department,
    designation,
    gender,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
    isVerified: true,
    profileImage,
  });

  // ✅ Bilingual full name for email
  const fullName = `${firstName?.en || ""} ${middleName?.en || ""} ${
    lastName?.en || ""
  }`.trim();

  // ✅ Prepare email message
const message = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff; border: 1px solid #dcdcdc; border-radius: 8px; overflow: hidden;">
    <div style="background: #ffffff; padding: 20px 30px;">
      <h2 style="color: #000000; font-weight: 600; font-size: 20px; margin-bottom: 10px;">
        Welcome! Your Cotco CMS Management account is ready
      </h2>
      <img src="https://cotco-vn.com/img/home/footerLogo.png" alt="Cotco Logo" style="height: 60px; margin: 15px 0;">
      <p style="color: #333333; line-height: 1.6; font-size: 15px;">
        Hi <strong>${fullName}</strong>,<br>
        You have been invited to join <strong>Cotco CMS Management</strong> — our Website Content Management platform.<br>
        Click the button below to get started:
      </p>

      <div style="text-align: left; margin: 25px 0;">
        <a href="https://cotco-vn.com/login"
           style="background: #0085C8; color: #fff; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: 500; display: inline-block;">
          Login Here
        </a>
      </div>

      <div style="border-top: 1px solid #e5e5e5; margin: 25px 0;"></div>

      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0;">
        <strong>Email:</strong> ${email}<br>
        <strong>Temporary Password:</strong> ${rawPassword}<br>
        <strong>Role:</strong> ${role?.name?.en || "—"}<br>
      </p>

      <p style="color: #333333; font-size: 15px; margin-top: 25px;">
        Regards,<br>
        <strong>Cotco</strong>
      </p>
    </div>

    <div style="background: #f7f7f7; text-align: center; padding: 10px; font-size: 12px; color: #777;">
      © ${new Date().getFullYear()} Cotco — Cotton Fiber Textile Machine
    </div>
  </div>
`;


  try {
    await sendEmail({
      email: user.email,
      subject: "Your Account Credentials",
      message,
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        employeeId,
        name: {
          en: fullName,
          vi: `${firstName?.vi || ""} ${middleName?.vi || ""} ${
            lastName?.vi || ""
          }`.trim(),
        },
        email,
        gender,
        dateOfBirth,
        dateOfJoining,
        role: { id: role._id, name: role.name },
        profileImage,
      },
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    console.error("❌ Email send failed:", err);
    return next(
      new ErrorResponse("User created but email could not be sent", 500)
    );
  }
});


/* =========================================================
   LOGIN (Email or Employee ID)
========================================================= */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, employeeId, password } = req.body;

  // ✅ Check if identifier (email or employeeId) is provided
  if ((!email && !employeeId) || !password) {
    return next(
      new ErrorResponse("Please provide email or employee ID and password", 400)
    );
  }

  // ✅ Find user by either email or employeeId
  const user = await User.findOne({
    $or: [{ email }, { employeeId }],
  })
    .select("+password")
    .populate("role", "name permissions");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // ✅ Match password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // ✅ Generate JWT token
  const token = user.getSignedJwtToken();

  // ✅ Return user info and token
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role
        ? {
            id: user.role._id,
            name: user.role.name,
            permissions: user.role.permissions,
          }
        : null,
    },
  });
});

/* =========================================================
   ME (Current User)
========================================================= */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("role");
  res.status(200).json({ success: true, data: user });
});

/* =========================================================
   UPDATE DETAILS
========================================================= */
exports.updateDetails = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const fieldsToUpdate = { name, email, phone };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

/* =========================================================
   UPDATE PASSWORD (Logged-in user)
========================================================= */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password incorrect", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

/* =========================================================
   FORGOT PASSWORD (Send OTP)
========================================================= */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse("Provide email", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorResponse("No user found", 404));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  const message = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP: <strong>${otp}</strong></p>
    <p>Valid for 30 minutes.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message,
    });
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

/* =========================================================
   RESET PASSWORD (With OTP)
========================================================= */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next(new ErrorResponse("Email, OTP & new password required", 400));
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) return next(new ErrorResponse("Invalid or expired OTP", 400));

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
});

/* =========================================================
   LOGOUT
========================================================= */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

/* =========================================================
   HELPER - Send JWT
========================================================= */
/* =========================================================
   HELPER - Send JWT
========================================================= */
const sendTokenResponse = (user, statusCode, res) => {
  // ✅ Safely extract role ID (fallback to null)
  const roleId = user.role && user.role._id ? user.role._id : null;

  // ✅ Generate token with fallback role ID
  const token = generateToken(user._id, roleId);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role
          ? {
              id: user.role._id,
              name: user.role.name,
              permissions: user.role.permissions,
            }
          : null,
      },
      token,
    });
};
