const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or local MongoDB instance using Mongoose.
 * Validates presence and structure of process.env.MONGODB_URI.
 * Prevents redundant open connections.
 *
 * @returns {Promise<typeof mongoose>} Active Mongoose instance
 */
const connectDB = async () => {
  // Return existing active connection to avoid redundant connections
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    const errorMsg = '[Database Configuration Error]: MONGODB_URI is not defined in the environment variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Detect unconfigured placeholder patterns from .env.example
  const placeholderPatterns = [
    '<username>',
    '<password>',
    '<cluster-url>',
    '<cluster>',
    'your_mongodb_uri'
  ];

  const hasPlaceholder = placeholderPatterns.some((pattern) => uri.includes(pattern));
  if (hasPlaceholder) {
    const errorMsg = '[Database Configuration Error]: MONGODB_URI contains unconfigured placeholder values. Please update MONGODB_URI with valid credentials.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`[Database]: MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error]: Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
