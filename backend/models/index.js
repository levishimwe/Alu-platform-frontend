const User = require('./User');
const Project = require('./Project');

// Define associations
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  
  User,
  Project
};