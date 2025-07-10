// backend/models/index.js
const { sequelize } = require("../config/database");
const User = require("./User");
const Project = require("./Project");
const Interaction = require("./Interaction");
const GraduateProfile = require("./GraduateProfile");
const InvestorProfile = require("./InvestorProfile");
const Message = require("./Message");

// Import associations
require("./associations");

// Sync models
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ All models synced with DB"))
  .catch((err) => console.error("❌ Sequelize sync error:", err));

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Project,
  Interaction,
  GraduateProfile,
  InvestorProfile,
  Message
};