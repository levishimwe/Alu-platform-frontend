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

// Define associations
User.hasMany(Project, { 
  foreignKey: 'userId', 
  as: 'projects',
  onDelete: 'CASCADE'
});

Project.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Graduate Profile associations
User.hasOne(GraduateProfile, { 
  foreignKey: 'userId', 
  as: 'graduateProfile',
  onDelete: 'CASCADE'
});

GraduateProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

// Investor Profile associations
User.hasOne(InvestorProfile, { 
  foreignKey: 'userId', 
  as: 'investorProfile',
  onDelete: 'CASCADE'
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