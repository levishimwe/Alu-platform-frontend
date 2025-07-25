const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Interaction extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Interaction.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('like', 'view', 'contact', 'favorite'),
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    targetType: {
      type: DataTypes.ENUM('project', 'user'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Interaction',
    tableName: 'Interactions',
    timestamps: true
  });

  return Interaction;
};