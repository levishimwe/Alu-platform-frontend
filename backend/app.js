const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes (REMOVE users route)
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 5000
// Database connection
testConnection()
  .then((connected) => {
    if (connected) {
      console.log("✅ Database connected and models synchronized...");
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
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

// API routes (ONLY auth and projects)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ALU Platform API - Google Drive Integration',
    version: '2.0.0',
    features: ['Google Drive image links', 'Google email validation'],
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
      googleEmailValidation: true
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
      health: '/api/health'
    },
    requirements: {
      email: 'Google emails only (@gmail.com, @googlemail.com)',
      images: 'Google Drive links only'
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
  console.log(`✉️ Email restriction: Google emails only`);
  console.log(`🖼️ Image hosting: Google Drive links only`);
});

module.exports = app;
