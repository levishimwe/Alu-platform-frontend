// backend/models/Project.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  impactArea: DataTypes.STRING,
  images: DataTypes.TEXT,
  videos: DataTypes.TEXT,
  documents: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('draft', 'published', 'under_review'),
    defaultValue: 'under_review',
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  graduateId: {
    type: DataTypes.INTEGER,
    allowNull: true, // ✅ Allow null to support ON DELETE SET NULL
  },
});

module.exports = Project;
