const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    required: [true, "Please provide an Employee ID"],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },

  // ✅ Role reference (Super Admin, Admin, etc.)
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"], // ✅ Consistent with frontend
    default: "Active",
  },

  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    trim: true,
    maxlength: [20, "Phone number cannot be more than 20 characters"],
  },

  profileImage: {
    type: String,
    default: "",
  },

  // ✅ New HR-related fields
  department: {
    type: String,
    trim: true,
    default: "",
  },
  designation: {
    type: String,
    trim: true,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    default: "Others",
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfJoining: {
    type: Date,
  },

  // ✅ System control fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/* =========================================================
   🔐 Encrypt password before saving
========================================================= */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* =========================================================
   🔁 Auto-update updatedAt
========================================================= */
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

/* =========================================================
   ✅ Compare entered password with hashed password
========================================================= */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* =========================================================
   🎟️ Generate Signed JWT Token
========================================================= */
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role, // include role reference for auth
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};

module.exports = mongoose.model("User", userSchema);
