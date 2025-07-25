const { sequelize } = require('../config/database');

// Import model definitions
const UserModel = require('./User');
const ProjectModel = require('./Project');
const GraduateProfileModel = require('./GraduateProfile');
const InvestorProfileModel = require('./InvestorProfile');

// Initialize models
const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);
const GraduateProfile = GraduateProfileModel(sequelize);
const InvestorProfile = InvestorProfileModel(sequelize);

// Define associations - UPDATED to match your associations.js
User.hasMany(Project, { 
  foreignKey: 'graduateId', // ✅ Changed from 'userId' to 'graduateId'
  as: 'projects',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Project.belongsTo(User, { 
  foreignKey: 'graduateId', // ✅ Changed from 'userId' to 'graduateId'
  as: 'graduate' // ✅ Changed from 'user' to 'graduate'
});

// Graduate Profile associations
User.hasOne(GraduateProfile, { 
  foreignKey: 'userId', 
  as: 'graduateProfile',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

GraduateProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Investor Profile associations
User.hasOne(InvestorProfile, { 
  foreignKey: 'userId', 
  as: 'investorProfile',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

InvestorProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Export models and sequelize
module.exports = {
  sequelize,
  User,
  Project,
  GraduateProfile,
  InvestorProfile,
};