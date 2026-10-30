const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const sendSuccess = require('./utils/apiResponse');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Secure HTTP response headers
app.use(helmet());

// Cross-Origin Resource Sharing configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (suppressed during test runs)
if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// Baseline API health check endpoint
app.get('/api/health', (req, res) => {
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
});

// 404 Fallback for unhandled endpoints
app.use(notFoundMiddleware);

// Centralized error handling middleware
app.use(errorMiddleware);

module.exports = app;
