const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Start with debugging information
console.log('⚙️ Starting ALU Platform API server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');

require('dotenv').config();

const { testConnection, isDatabaseConnected } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const profileRoutes = require('./routes/profiles');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 5000;

// Global variable to track database status
let dbConnected = false;

// Database connection WITHOUT model synchronization
testConnection()
  .then(async (connected) => {
    dbConnected = connected;
    if (connected) {
      console.log("✅ Database connected successfully...");
      console.log("✅ Using existing database schema with raw SQL queries");
      console.log("✅ Skipping model sync to preserve manually added columns");
    } else {
      console.error("❌ Failed to connect to database");
      // CRITICAL: Don't exit in production - continue without DB
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    }
  })
  .catch((err) => {
    console.error("❌ DB Error: ", err);
    // CRITICAL: Don't exit in production - continue without DB
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
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
    'http://172.26.10.146:3000',
    'http://0.0.0.0:3000',
    'https://alu-platform-frontend.vercel.app',
    'https://alu-platform-frontend-fza9.vercel.app',
    /\.vercel\.app$/
  ],
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

// Database status middleware - add this before your routes
app.use((req, res, next) => {
  // Skip DB check for health endpoint and static assets
  if (req.path === '/api/health' || req.path === '/' || req.path.startsWith('/static')) {
    return next();
  }
  
  // Check if database is connected for important API routes
  if (!dbConnected && req.path.startsWith('/api/')) {
    console.log(`⚠️ DB disconnected, request to ${req.path} rejected`);
    
    // Special handling for login/register
    if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Database connection is currently down. Please try again later.'
      });
    }
    
    return res.status(503).json({
      error: 'Database service unavailable',
      message: 'The server is experiencing database connectivity issues. Please try again later.'
    });
  }
  
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ALU Platform API - Google Drive Integration',
    version: '2.0.0',
    features: ['Google Drive image links', 'YouTube video links', 'Google email validation', 'Profile management'],
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register (Google emails only)',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      projects: {
        create: 'POST /api/projects',
        list: 'GET /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id'
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
      },
      messages: {
        send: 'POST /api/messages',
        list: 'GET /api/messages',
        get: 'GET /api/messages/:id'
      }
    },
    status: dbConnected ? 'fully operational' : 'partially operational',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    features: {
      googleDriveIntegration: true,
      youTubeIntegration: true,
      googleEmailValidation: true,
      profileManagement: dbConnected,
      projectManagement: dbConnected,
      messaging: dbConnected
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
      messages: '/api/messages',
      users: '/api/users',
      admin: '/api/admin',
      health: '/api/health'
    },
    status: dbConnected ? 'fully operational' : 'partially operational',
    database: dbConnected ? 'connected' : 'disconnected',
    requirements: {
      email: 'Google emails only (@gmail.com, @googlemail.com)',
      images: 'Google Drive links only',
      videos: 'YouTube links only',
      documents: 'Google Drive links only',
      university: 'African Leadership University only',
      majors: 'BSE, BEL, IBT only'
    },
    databaseSchema: {
      projects: {
        supportedFields: [
          'id', 'title', 'description', 'category', 'impactArea',
          'technologies', 'images', 'videos', 'documents', 
          'status', 'fundingGoal', 'currentFunding', 
          'demoUrl', 'repoUrl', 'featured', 'graduateId'
        ]
      }
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

// Only start server when running directly (not when imported by Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 API base: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`📁 Projects endpoints: http://localhost:${PORT}/api/projects`);
    console.log(`👤 Profile endpoints: http://localhost:${PORT}/api/profiles`);
    console.log(`💬 Messages endpoints: http://localhost:${PORT}/api/messages`);
    console.log(`👥 Users endpoints: http://localhost:${PORT}/api/users`);
    console.log(`⚙️  Admin endpoints: http://localhost:${PORT}/api/admin`);
    console.log(`✉️ Email restriction: Google emails only`);
    console.log(`🖼️ Image hosting: Google Drive links only`);
    console.log(`🎥 Video hosting: YouTube links only`);
    console.log(`📄 Document hosting: Google Drive links only`);
    console.log(`🎓 University restriction: African Leadership University only`);
    console.log(`📚 Major restriction: BSE, BEL, IBT only`);
  });
}

// Export for Vercel
module.exports = app;
