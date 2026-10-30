const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const sendSuccess = require('./utils/apiResponse');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Secure HTTP response headers
app.use(helmet());

// Cross-Origin Resource Sharing configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (suppressed during test runs)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// 404 Fallback for unhandled endpoints
app.use(notFoundMiddleware);

// Centralized error handling middleware
app.use(errorMiddleware);

module.exports = app;
