const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

let server;
let isShuttingDown = false;

/**
 * Handles graceful server shutdown upon SIGINT / SIGTERM.
 * Closes HTTP listener and active database connections.
 *
 * @param {string} signal - The termination signal received
 */
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`\n[Server]: Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Server]: HTTP server closed successfully.');

      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          console.log('[Database]: MongoDB connection closed.');
        }
        process.exit(0);
      } catch (err) {
        console.error(`[Server Error]: Error during database disconnection: ${err.message}`);
        process.exit(1);
      }
    });

    // Fallback force shutdown after 10s if connections linger
    setTimeout(() => {
      console.error('[Server Error]: Forcefully terminating process after shutdown timeout.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
};

/**
 * Boots the database connection and launches the HTTP listener.
 */
const startServer = async () => {
  try {
    // Establish database connection prior to listening
    await connectDB();

    // Ensure default seeded accounts (Super Admin, Instructors) and academic calendar exist
    try {
      const seedDatabase = require('./config/seed');
      await seedDatabase();
    } catch (seedErr) {
      console.warn(`[Server Warning]: Default database sync skipped: ${seedErr.message}`);
    }

    server = app.listen(PORT, () => {
      console.log(`[Server]: EngiLab API listening on port ${PORT} [${NODE_ENV}]`);
    });

    // Register process termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle unexpected fatal errors
    process.on('unhandledRejection', (reason) => {
      console.error('[Server Error]: Unhandled Promise Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server Error]: Uncaught Exception thrown:', err);
      gracefulShutdown('uncaughtException');
    });
  } catch (error) {
    console.error(`[Server Error]: Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
