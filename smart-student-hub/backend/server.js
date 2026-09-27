const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { getPool, closePool, testConnection, initializeDatabase } = require('./config/database');

// Load environment variables
dotenv.config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';

// Fail fast on missing configuration instead of running with insecure defaults
const requiredEnv = ['JWT_SECRET'];
if (isProduction) {
  requiredEnv.push('FRONTEND_URL');
  if (!process.env.DATABASE_URL) requiredEnv.push('DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD');
}
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}
if (isProduction && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
const PORT = process.env.PORT || 5000;

// Browser origins allowed to call the API. CORS_ORIGINS is a comma-separated list; defaults to FRONTEND_URL.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL)
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Behind a reverse proxy / PaaS load balancer (Render, Railway, nginx)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    // Non-browser clients (curl, server-to-server) send no Origin header
    if (!origin || !isProduction || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
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

// Health check endpoint (reports unhealthy when the database is unreachable)
app.get('/health', async (req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-management', require('./routes/admin-management'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/webhook', require('./routes/webhook').router);
app.use('/api/sheets', require('./routes/sheets'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
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

// Start server with database initialization. Exit if the database is unavailable
// so the process manager / platform restarts us instead of serving broken requests.
const startServer = async () => {
  try {
    await testConnection();
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    console.log(`🌐 Allowed origins: ${isProduction ? allowedOrigins.join(', ') : 'all (development)'}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    // Force exit if connections do not drain in time
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

startServer();

module.exports = app;
