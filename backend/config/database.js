// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // e.g., 'alu_platform'
  process.env.DB_USER,      // e.g., 'root'
  process.env.DB_PASSWORD,  // e.g., 'password'
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // optional: turn off SQL logging
  }
);

// Export as an object with sequelize property
module.exports = { sequelize };
