const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const profileRoutes = require('./routes/profiles');
const messageRoutes = require('./routes/messages'); // Add this
const userRoutes = require('./routes/users'); // Add this
const adminRoutes = require('./routes/admin');
const models = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection and model synchronization
testConnection()
  .then(async (connected) => {
    if (connected) {
      console.log("✅ Database connected successfully...");
      
      // Sync models with database (in development)
      if (process.env.NODE_ENV === 'development') {
        try {
          await models.User.sync({ alter: true });
          console.log("✅ User model synchronized");
          
          await models.GraduateProfile.sync({ alter: true });
          console.log("✅ GraduateProfile model synchronized");
          
          await models.InvestorProfile.sync({ alter: true });
          console.log("✅ InvestorProfile model synchronized");
          
          if (models.Project) {
            await models.Project.sync({ alter: true });
            console.log("✅ Project model synchronized");
          }
          
          console.log("✅ All models synchronized successfully");
        } catch (syncError) {
          console.error("❌ Error synchronizing models:", syncError);
        }
      }
    } else {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("❌ DB Error: ", err);
    process.exit(1);
  });

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.26.10.146:3000', // Add your IP address
    'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },

});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/messages', messageRoutes); // Add this
app.use('/api/users', userRoutes); // Add this
app.use('/api/admin', adminRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ALU Platform API - Google Drive Integration',
    version: '2.0.0',
    features: ['Google Drive image links', 'Google email validation', 'Profile management'],
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register (Google emails only)',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'PUT /api/auth/profile'
      },
      projects: {
        create: 'POST /api/projects',
        list: 'GET /api/projects',
        get: 'GET /api/projects/:id'
      },
      profiles: {
        graduate: {
          get: 'GET /api/profiles/graduate/:id',
          update: 'PUT /api/profiles/graduate'
        },
        investor: {
          get: 'GET /api/profiles/investor/:id',
          update: 'PUT /api/profiles/investor'
        }
      }
    },
    status: 'operational'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected',
    features: {
      googleDriveIntegration: true,
      googleEmailValidation: true,
      profileManagement: true
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ALU Platform API - Google Drive Integration',
    version: '2.0.0',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      profiles: '/api/profiles',
      health: '/api/health'
    },
    requirements: {
      email: 'Google emails only (@gmail.com, @googlemail.com)',
      images: 'Google Drive links only',
      university: 'African Leadership University only',
      majors: 'BSE, BEL, IBT only'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {

  console.error('Server Error:', error);

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 API base: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📁 Projects endpoints: http://localhost:${PORT}/api/projects`);
  console.log(`👤 Profile endpoints: http://localhost:${PORT}/api/profiles`);
  console.log(`✉️ Email restriction: Google emails only`);
  console.log(`🖼️ Image hosting: Google Drive links only`);
  console.log(`🎓 University restriction: African Leadership University only`);
  console.log(`📚 Major restriction: BSE, BEL, IBT only`);
});

module.exports = app;
