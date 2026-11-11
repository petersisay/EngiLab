const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const sendSuccess = require('./utils/apiResponse');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// Route modules
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const departmentRoutes = require('./routes/department.routes');
const academicRoutes = require('./routes/academic.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const submissionRoutes = require('./routes/submission.routes');
const gradeRoutes = require('./routes/grade.routes');
const resourceRoutes = require('./routes/resource.routes');
const communicationRoutes = require('./routes/communication.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Trust reverse proxy (essential for Render / Vercel deployments to correctly detect HTTPS and cookies)
app.set('trust proxy', 1);

// Secure HTTP response headers allowing cross-origin requests
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Cross-Origin Resource Sharing configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'https://engi-lab.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        !env.isProduction
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback to avoid CORS failures across deployed instances
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Cookie parsing middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (name) req.cookies[name] = decodeURIComponent(value);
    });
  }
  next();
});

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (suppressed during test runs)
if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// Baseline API health check endpoints
const handleHealthCheck = (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'EngiLab API is operating normally',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV
    }
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/api/v1/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// Mount API routes across /api/v1, /api, and root prefixes for deployment flexibility
const routePrefixes = ['/api/v1', '/api', ''];

routePrefixes.forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/departments`, departmentRoutes);
  app.use(`${prefix}/academic`, academicRoutes);
  app.use(`${prefix}/exercises`, exerciseRoutes);
  app.use(`${prefix}/submissions`, submissionRoutes);
  app.use(`${prefix}/grades`, gradeRoutes);
  app.use(`${prefix}/resources`, resourceRoutes);
  app.use(`${prefix}/communication`, communicationRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
});

// 404 Fallback for unhandled endpoints
app.use(notFoundMiddleware);

// Centralized error handling middleware
app.use(errorMiddleware);

module.exports = app;
