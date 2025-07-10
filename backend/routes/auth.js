// === backend/routes/auth.js ===
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/oauth/google", authController.googleOAuth);
router.post("/oauth/linkedin", authController.linkedinOAuth);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/verify-email/:token", authController.verifyEmail);

module.exports = router;
