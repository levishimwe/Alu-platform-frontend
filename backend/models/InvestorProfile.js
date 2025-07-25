const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class InvestorProfile extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  InvestorProfile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ✅ Changed from false to true to allow SET NULL
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    investmentFocus: {
      type: DataTypes.JSON,
      allowNull: true
    },
    investmentRange: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    portfolio: {
      type: DataTypes.JSON,
      allowNull: true
    },
    linkedinProfile: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'InvestorProfile',
    tableName: 'InvestorProfiles',
    timestamps: true
  });

  return InvestorProfile;
};