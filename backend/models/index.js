const { sequelize } = require('../config/database');

// Import model definitions
const UserModel = require('./User');
const ProjectModel = require('./Project');

// Initialize models
const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);

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

// Export models and sequelize
module.exports = {
  sequelize,
  User,
  Project,
};