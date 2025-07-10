const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  investorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // This should match your User table name
      key: 'id',
    },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects', // This should match your Project table name
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('bookmark', 'interest', 'contact'),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'active',
  },
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  tableName: 'Interactions', // Explicit table name
});

module.exports = Interaction;
