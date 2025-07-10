// === backend/utils/validators.js ===
const { body } = require("express-validator");

exports.registerValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
];

exports.projectValidator = [
  body("title").notEmpty().withMessage("Project title is required"),
  body("description").notEmpty().withMessage("Project description is required"),
];
