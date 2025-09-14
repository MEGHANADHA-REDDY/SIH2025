const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, initializeDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// Environment variables are loaded from .env file above
// Only set defaults for variables not in .env
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Student Hub API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server with database initialization
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Documentation: Check the README.md file`);
      console.log(`✅ Database connected and initialized successfully`);
    });
  } catch (error) {
    console.error('⚠️ Database connection failed:', error.message);
    console.log('📝 Please ensure PostgreSQL is running and update your .env file');
    console.log('🔧 You can still test the API endpoints, but database operations will fail');
    
    // Start the server anyway for testing
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📖 API Documentation: Check the README.md file`);
      console.log(`⚠️ Note: Database operations will fail until PostgreSQL is configured`);
    });
  }
};

startServer();

module.exports = app;
