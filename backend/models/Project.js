const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000],
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true, // Made optional to match DB
      validate: {
        isIn: [['Technology', 'Healthcare', 'Education', 'Agriculture', 'Finance', 'Environment', 'Social Impact', 'Other']],
      },
    },
    impactArea: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ❌ Remove stage field - doesn't exist in DB
    
    images: {
      type: DataTypes.TEXT, // ✅ Change to TEXT to match DB (stores JSON strings)
      allowNull: true,
      get() {
        const value = this.getDataValue('images');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('images', value ? JSON.stringify(value) : null);
      }
    },
    videos: {
      type: DataTypes.TEXT, // ✅ Change to TEXT to match DB (stores JSON strings)
      allowNull: true,
      get() {
        const value = this.getDataValue('videos');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('videos', value ? JSON.stringify(value) : null);
      }
    },
    documents: {
      type: DataTypes.TEXT, // ✅ Change to TEXT to match DB (stores JSON strings)
      allowNull: true,
      get() {
        const value = this.getDataValue('documents');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('documents', value ? JSON.stringify(value) : null);
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'under_review'), // ✅ Match DB enum values
      allowNull: true,
      defaultValue: 'under_review',
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    graduateId: { // ✅ Add this field to match DB
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    // ❌ Remove userId field - doesn't exist in DB
  }, {
    timestamps: true,
    tableName: 'Projects' // ✅ Explicitly set table name
  });

  return Project;
};