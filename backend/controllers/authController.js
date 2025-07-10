const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendVerificationEmail } = require("../services/emailService");

// --- Already implemented
exports.register = async (req, res) => {
  console.log("📝 Registration attempt started");
  console.log("Request body:", req.body);
  
  const { email, password, userType, firstName, lastName, country, city } = req.body;
  
  try {
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");
    
    console.log("👤 Creating user in database...");
    const newUser = await User.create({
      email,
      password: hashedPassword,
      userType,
      firstName,
      lastName,
      country,
      city,
      isVerified: false,
    });
    console.log("✅ User created successfully:", newUser.id);
    
    console.log("📧 Sending verification email...");
    sendVerificationEmail(newUser); // Placeholder
    console.log("✅ Verification email sent");
    
    res.status(201).json({ message: "Registered successfully, verify email." });
  } catch (error) {
    console.error("❌ Registration error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, userType } = req.body;
  try {
    const user = await User.findOne({ where: { email, userType } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user.id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

// --- Add these placeholder functions:
exports.googleOAuth = (req, res) => {
  res.send("Google OAuth not implemented yet.");
};

exports.linkedinOAuth = (req, res) => {
  res.send("LinkedIn OAuth not implemented yet.");
};

exports.logout = (req, res) => {
  res.send("Logout not implemented yet.");
};

exports.forgotPassword = (req, res) => {
  res.send("Forgot password not implemented yet.");
};

exports.resetPassword = (req, res) => {
  res.send("Reset password not implemented yet.");
};

exports.verifyEmail = (req, res) => {
  res.send(`Verifying email with token: ${req.params.token}`);
};
