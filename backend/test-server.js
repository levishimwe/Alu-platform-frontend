#!/usr/bin/env node

// Simple test script to validate server configuration
console.log('🔍 Testing server configuration...');

try {
  // Test environment variables
  require('dotenv').config();
  
  console.log('✅ Environment variables loaded');
  console.log('📊 DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Missing');
  console.log('📊 DB_NAME:', process.env.DB_NAME ? '✅ Set' : '❌ Missing');
  console.log('📊 DB_USER:', process.env.DB_USER ? '✅ Set' : '❌ Missing');
  console.log('📊 DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing');
  console.log('📊 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
  
  // Test database connection
  console.log('\n🔗 Testing database connection...');
  const { testConnection } = require('./config/database');
  
  testConnection()
    .then((connected) => {
      if (connected) {
        console.log('✅ Database connection successful');
        
        // Test loading models
        console.log('\n📦 Testing models...');
        try {
          const models = require('./models');
          console.log('✅ Models loaded successfully');
          console.log('📊 Available models:', Object.keys(models));
          
          // Test loading routes
          console.log('\n🛣️  Testing routes...');
          try {
            const authRoutes = require('./routes/auth');
            const projectRoutes = require('./routes/projects');
            const profileRoutes = require('./routes/profiles');
            const messageRoutes = require('./routes/messages');
            const userRoutes = require('./routes/users');
            const adminRoutes = require('./routes/admin');
            const emailRoutes = require('./routes/email');
            
            console.log('✅ All routes loaded successfully');
            
            // Test app initialization
            console.log('\n🚀 Testing app initialization...');
            const app = require('./app');
            console.log('✅ App initialized successfully');
            
            console.log('\n🎉 All tests passed! Server should work correctly.');
            process.exit(0);
            
          } catch (routeError) {
            console.error('❌ Route loading error:', routeError.message);
            process.exit(1);
          }
          
        } catch (modelError) {
          console.error('❌ Model loading error:', modelError.message);
          process.exit(1);
        }
        
      } else {
        console.error('❌ Database connection failed');
        process.exit(1);
      }
    })
    .catch((dbError) => {
      console.error('❌ Database error:', dbError.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
