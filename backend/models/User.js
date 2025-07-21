const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isGoogleEmail(value) {
          if (!value.endsWith('@gmail.com') && !value.endsWith('@googlemail.com')) {
            throw new Error('This email is not accepted. Please use a Google email address.');
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    userType: {
      type: DataTypes.ENUM('graduate', 'investor', 'admin'),
      allowNull: false,
      defaultValue: 'graduate',
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isGoogleDriveLink(value) {
          if (value && !value.includes('drive.google.com')) {
            throw new Error('Profile image must be a Google Drive link');
          }
        },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1950,
        max: new Date().getFullYear() + 10,
      },
    },
    degreeCertificate: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isGoogleDriveLink(value) {
          if (value && !value.includes('drive.google.com')) {
            throw new Error('Degree certificate must be a Google Drive link');
          }
        },
      },
    },
    // Investor-specific fields
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    // Location fields for both graduates and investors
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        
        // Convert Google Drive links
        if (user.profileImage) {
          user.profileImage = convertGoogleDriveLink(user.profileImage);
        }
        if (user.degreeCertificate) {
          user.degreeCertificate = convertGoogleDriveLink(user.degreeCertificate);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        
        // Convert Google Drive links
        if (user.changed('profileImage') && user.profileImage) {
          user.profileImage = convertGoogleDriveLink(user.profileImage);
        }
        if (user.changed('degreeCertificate') && user.degreeCertificate) {
          user.degreeCertificate = convertGoogleDriveLink(user.degreeCertificate);
        }
      },
    },
  });

  // Convert Google Drive sharing link to direct viewable link
  function convertGoogleDriveLink(url) {
    if (!url) return null;
    
    // Check if it's already a direct link
    if (url.includes('drive.google.com/uc?id=')) {
      return url;
    }
    
    // Extract file ID from sharing URL
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?id=${fileId}&export=view`;
    }
    
    // If it's already a direct link or different format, return as is
    return url;
  }

  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};