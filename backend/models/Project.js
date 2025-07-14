//backend/models/Project.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  graduateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'graduateId' // Explicitly map to the correct column
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  impactArea: {
    type: DataTypes.STRING,
    allowNull: true
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  documents: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'under_review'),
    defaultValue: 'under_review'
  }
}, {
  tableName: 'Projects',
  timestamps: true,
  // Add this to prevent Sequelize from auto-adding columns
  freezeTableName: true,
  // Explicitly define which columns to select
  defaultScope: {
    attributes: {
      exclude: ['userId'] // Exclude userId even if Sequelize tries to add it
    }
  }
});

module.exports = Project;
