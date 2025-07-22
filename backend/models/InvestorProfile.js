const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  const InvestorProfile = sequelize.define('InvestorProfile', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companySize: {
      type: DataTypes.STRING,
      allowNull: true
    },
    industryFocus: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    investmentRange: {
      type: DataTypes.STRING,
      allowNull: true
    },
    investmentStage: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    investmentCriteria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    portfolio: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    areasOfInterest: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'InvestorProfiles',
    timestamps: true
  });

  return InvestorProfile;
};