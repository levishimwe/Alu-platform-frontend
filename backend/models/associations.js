const User = require('./User');
const GraduateProfile = require('./GraduateProfile');
const InvestorProfile = require('./InvestorProfile');
const Project = require('./Project');
const Interaction = require('./Interaction');
const Message = require('./Message'); // ✅ Import the Message model

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

// Project Associations
User.hasMany(Project, {
  foreignKey: { name: 'graduateId', allowNull: true },
  as: 'projects',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Project.belongsTo(User, {
  foreignKey: { name: 'graduateId', allowNull: true },
  as: 'graduate',
});

// Interaction Associations
User.hasMany(Interaction, {
  foreignKey: { name: 'investorId', allowNull: true },
  as: 'interactions',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Interaction.belongsTo(User, {
  foreignKey: { name: 'investorId', allowNull: true },
  as: 'investor',
});

Project.hasMany(Interaction, {
  foreignKey: { name: 'projectId', allowNull: true },
  as: 'interactions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Interaction.belongsTo(Project, {
  foreignKey: { name: 'projectId', allowNull: true },
  as: 'project',
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
