const User = require('./User');
const GraduateProfile = require('./GraduateProfile');
const InvestorProfile = require('./InvestorProfile');
const Project = require('./Project');
const Interaction = require('./Interaction');
const Message = require('./Message');

// === Associations ===

// User Profile Associations
User.hasOne(GraduateProfile, {
  foreignKey: { name: 'userId', allowNull: true },
  as: 'graduateProfile',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
GraduateProfile.belongsTo(User, {
  foreignKey: { name: 'userId', allowNull: true },
  as: 'user',
});

// Investor Profile Associations
User.hasOne(InvestorProfile, {
  foreignKey: { name: 'userId', allowNull: true },
  as: 'investorProfile',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
InvestorProfile.belongsTo(User, {
  foreignKey: { name: 'userId', allowNull: true },
  as: 'user',
});

// Project Associations - Updated to use graduateId
User.hasMany(Project, {
  foreignKey: { name: 'graduateId', allowNull: true }, // Changed from userId to graduateId
  as: 'projects',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Project.belongsTo(User, {
  foreignKey: { name: 'graduateId', allowNull: true }, // Changed from userId to graduateId
  as: 'graduate', // Changed from 'user' to 'graduate' for clarity
});

// Message Associations
User.hasMany(Message, {
  foreignKey: { name: 'senderId', allowNull: true },
  as: 'sentMessages',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
User.hasMany(Message, {
  foreignKey: { name: 'receiverId', allowNull: true },
  as: 'receivedMessages',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Message.belongsTo(User, {
  foreignKey: { name: 'senderId', allowNull: true },
  as: 'sender',
});
Message.belongsTo(User, {
  foreignKey: { name: 'receiverId', allowNull: true },
  as: 'receiver',
});

module.exports = {
  User,
  GraduateProfile,
  InvestorProfile,
  Project,
  Interaction,
  Message,
};
