const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const projectsUploadsDir = path.join(__dirname, 'uploads/projects');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(projectsUploadsDir)) {
  fs.mkdirSync(projectsUploadsDir, { recursive: true });
}

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected...");
    console.log("✅ Using existing database tables...");
    // Don't sync to avoid modifying existing tables
  })
  
  .catch((err) => console.error("❌ DB Error: ", err));

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

// Rate limiting (exclude file uploads from strict limits)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => {
    // Skip rate limiting for file uploads
    return req.path.includes('/projects') && req.method === 'POST';
  }
});
app.use('/api/', limiter);

// Body parsing middleware with increased limits
app.use(express.json({ limit: '50mb' })); // Increased from 10mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased from 10mb

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ALU Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout'
      },
      projects: {
        create: 'POST /api/projects',
        list: 'GET /api/projects',
        get: 'GET /api/projects/:id'
      },
      documentation: '/api-docs (coming soon)'
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
    database: 'connected'
  });
});

// Root endpoint with API info
app.get('/', (req, res) => {
  res.json({
    message: 'ALU Platform API',
    version: '1.0.0',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      health: '/api/health'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler with specific multer error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Handle multer errors specifically
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      message: `File size limit exceeded. Maximum allowed size is 200MB for videos, 10MB for documents, and 5MB for images.`,
      field: error.field
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ 
      error: 'Too many files',
      message: 'Maximum 20 files allowed per upload.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file field',
      message: 'Unexpected file field in upload.'
    });
  }
  
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
  console.log(`📂 File size limits: Images(5MB), Documents(10MB), Videos(200MB)`);
});

module.exports = app;
