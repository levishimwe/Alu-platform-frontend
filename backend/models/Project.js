const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Project extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    graduateId: { // ✅ Changed from userId to graduateId
      type: DataTypes.INTEGER,
      allowNull: true, // ✅ Allow null for SET NULL cascade
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    technologies: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'completed', 'rejected'),
      defaultValue: 'draft'
    },
    fundingGoal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currentFunding: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    demoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    repoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'Projects',
    timestamps: true
  });

  return Project;
};