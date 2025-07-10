const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GraduateProfile = sequelize.define('GraduateProfile', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,  // important for ON DELETE SET NULL
  },
  aluDegreeDocument: DataTypes.TEXT,
  graduationYear: DataTypes.INTEGER,
  specialization: DataTypes.STRING,
});

module.exports = GraduateProfile;
