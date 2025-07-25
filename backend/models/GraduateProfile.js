const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class GraduateProfile extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  GraduateProfile.init({
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
    skills: {
      type: DataTypes.JSON,
      allowNull: true
    },
    projects: {
      type: DataTypes.JSON,
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    portfolio: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    availability: {
      type: DataTypes.ENUM('available', 'busy', 'not_available'),
      defaultValue: 'available'
    }
  }, {
    sequelize,
    modelName: 'GraduateProfile',
    tableName: 'GraduateProfiles',
    timestamps: true
  });

  return GraduateProfile;
};