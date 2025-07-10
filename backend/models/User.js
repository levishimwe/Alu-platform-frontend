const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Add destructuring here

console.log(sequelize); // This should now show the Sequelize instance
const User = sequelize.define('User', {
  userType: {
    type: DataTypes.ENUM('graduate', 'investor', 'admin'),
    allowNull: false,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: DataTypes.STRING,
  profileImage: DataTypes.TEXT,
  country: DataTypes.STRING,
  city: DataTypes.STRING,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = User;
