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

  firstName: {
    en: { type: String, required: [true, "Please add English first name"], trim: true },
    vi: { type: String, default: "", trim: true },
  },
  middleName: {
    en: { type: String, default: "", trim: true },
    vi: { type: String, default: "", trim: true },
  },
  lastName: {
    en: { type: String, required: [true, "Please add English last name"], trim: true },
    vi: { type: String, default: "", trim: true },
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

  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },

  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    trim: true,
  },

  profileImage: {
    type: String,
    default: "",
  },

  // ✅ Multilingual Department and Designation
  department: {
    en: { type: String, default: "" },
    vi: { type: String, default: "" },
  },
  designation: {
    en: { type: String, default: "" },
    vi: { type: String, default: "" },
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    default: "Others",
  },
  dateOfBirth: Date,
  dateOfJoining: Date,

  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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
