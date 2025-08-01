// === backend/middleware/validation.js ===
// Middleware for validating request data using express-validator
const { body } = require("express-validator");

const registerValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password too short"),
];

const projectValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
];

module.exports = {
  registerValidation,
  projectValidation,
};
