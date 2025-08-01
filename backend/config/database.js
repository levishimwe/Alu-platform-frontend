const { Sequelize } = require('sequelize');
require('dotenv').config();

// Add debugging for environment variables
console.log('Database connection settings:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- Database:', process.env.DB_NAME || 'alu_platform');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'alu_platform',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
    // Add longer timeout for serverless environment
    dialectOptions: {
      connectTimeout: 60000
    }
  }
);

// Global variable for tracking DB connection state
let isDbConnected = false;

// Test connection function - enhanced for serverless environment
const testConnection = async () => {
  try {
    console.log('🔌 Attempting database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // COMPLETELY DISABLE model sync - we use raw SQL queries
    console.log('✅ Database ready - using raw SQL queries only.');
    
    isDbConnected = true;
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    // Critical: In production, don't crash the app
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Running in production without database connection');
      return false;
    }
    
    isDbConnected = false;
    return false;
  }
};

// Function to check if DB is connected
const isDatabaseConnected = () => {
  return isDbConnected;
};

module.exports = {
  sequelize,
  testConnection,
  isDatabaseConnected
};