const mongoose = require('mongoose');

let memServer = null;

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

  let uri = process.env.MONGODB_URI;

  // Detect unconfigured placeholder patterns from .env.example
  const placeholderPatterns = [
    '<username>',
    '<password>',
    '<cluster-url>',
    '<cluster>',
    'your_mongodb_uri'
  ];

  const hasPlaceholder = uri && placeholderPatterns.some((pattern) => uri.includes(pattern));
  if (hasPlaceholder) {
    const errorMsg = '[Database Configuration Error]: MONGODB_URI contains unconfigured placeholder values. Please update MONGODB_URI with valid credentials.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // If MONGODB_URI is provided, try connecting to it first
  if (uri && typeof uri === 'string' && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });

      console.log(`[Database]: MongoDB connected successfully to host: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error(`[Database Error]: Failed to connect to MongoDB: ${error.message}`);
        throw error;
      }
      console.warn(`[Database Warning]: Could not connect to configured MONGODB_URI: ${error.message}`);
      console.warn('[Database Notice]: Initializing embedded in-memory MongoDB for local development...');
    }
  }

  // Development Fallback: In-Memory MongoDB Server
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!memServer) {
        memServer = await MongoMemoryServer.create();
      }
      const baseUri = memServer.getUri();
      uri = baseUri.endsWith('/') ? `${baseUri}engilab` : `${baseUri}/engilab`;
      process.env.MONGODB_URI = uri;
      const conn = await mongoose.connect(uri);
      console.log(`[Database]: Embedded in-memory MongoDB connected successfully at ${uri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database Error]: In-memory MongoDB initialization failed: ${memErr.message}`);
      throw memErr;
    }
  }

  const errorMsg = '[Database Configuration Error]: MONGODB_URI is not defined in the environment variables.';
  console.error(errorMsg);
  throw new Error(errorMsg);
};

module.exports = connectDB;
module.exports.connectDB = connectDB;

