const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InvestorProfile = sequelize.define('InvestorProfile', {
  companyName: DataTypes.STRING,
  companyWebsite: DataTypes.TEXT,
  investmentAreas: DataTypes.TEXT,
  portfolioSize: DataTypes.STRING,
});

module.exports = InvestorProfile;
