try {
  // Load environment variables if dotenv is present; fallback gracefully if not yet installed
  require('dotenv').config();
} catch (_) {
  // Environment variables already present in process.env or pending package installation
}

/**
 * Validates and parses a network TCP port number.
 *
 * @param {string|number} rawPort - Port string or number to validate
 * @returns {number} Validated port number
 */
const parsePort = (rawPort) => {
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT "${rawPort}". PORT must be a valid integer between 1 and 65535.`
    );
  }
  return port;
};

/**
 * Centralized environment variable validator and parser for EngiLab.
 * Ensures all required environment parameters are present and conform to type rules.
 *
 * @param {object} [source=process.env] - Environment variables source object
 * @returns {object} Validated, structured configuration object
 */
const validateEnv = (source = process.env) => {
  const errors = [];

  // 1. Validate NODE_ENV
  const validEnvironments = ['development', 'production', 'test'];
  const rawNodeEnv = source.NODE_ENV || 'development';
  const nodeEnv = String(rawNodeEnv).trim().toLowerCase();

  if (!validEnvironments.includes(nodeEnv)) {
    errors.push(
      `Invalid NODE_ENV "${rawNodeEnv}". Allowed environments: ${validEnvironments.join(', ')}.`
    );
  }

  // 2. Validate PORT
  let port = 5000;
  if (source.PORT !== undefined && source.PORT !== '') {
    try {
      port = parsePort(source.PORT);
    } catch (portError) {
      errors.push(portError.message);
    }
  }

  // 3. Validate MONGODB_URI when database configuration is required
  const rawMongoUri = source.MONGODB_URI ? String(source.MONGODB_URI).trim() : '';
  if (nodeEnv === 'production' && !rawMongoUri) {
    errors.push('MONGODB_URI is required in production environment.');
  } else if (rawMongoUri) {
    const placeholderPatterns = [
      '<username>',
      '<password>',
      '<cluster-url>',
      '<cluster>',
      'your_mongodb_uri'
    ];
    if (placeholderPatterns.some((placeholder) => rawMongoUri.includes(placeholder))) {
      errors.push(
        'MONGODB_URI contains unconfigured placeholder values from .env.example.'
      );
    }
  }

  // 4. Validate CLIENT_URL
  const clientUrl = source.CLIENT_URL ? String(source.CLIENT_URL).trim() : 'http://localhost:5173';

  // 5. Configurable institutional email domains (do not enforce if unverified)
  const allowedDomainsRaw = source.ASTU_ALLOWED_EMAIL_DOMAINS ? String(source.ASTU_ALLOWED_EMAIL_DOMAINS).trim() : '';
  const allowedEmailDomains = allowedDomainsRaw
    ? allowedDomainsRaw.split(',').map((domain) => domain.trim().toLowerCase()).filter(Boolean)
    : [];

  // 6. JWT Configuration (Tokens and lifetimes)
  const jwtAccessSecret = source.JWT_ACCESS_SECRET ? String(source.JWT_ACCESS_SECRET) : '';
  const jwtRefreshSecret = source.JWT_REFRESH_SECRET ? String(source.JWT_REFRESH_SECRET) : '';
  const jwtAccessExpiresIn = source.JWT_ACCESS_EXPIRES_IN ? String(source.JWT_ACCESS_EXPIRES_IN).trim() : '15m';
  const jwtRefreshExpiresIn = source.JWT_REFRESH_EXPIRES_IN ? String(source.JWT_REFRESH_EXPIRES_IN).trim() : '7d';

  if (nodeEnv === 'production') {
    if (!jwtAccessSecret) {
      errors.push('JWT_ACCESS_SECRET is required in production environment.');
    }
    if (!jwtRefreshSecret) {
      errors.push('JWT_REFRESH_SECRET is required in production environment.');
    }
  }

  // Fail fast with clear actionable error report
  if (errors.length > 0) {
    throw new Error(
      `[Environment Configuration Error]:\n  - ${errors.join('\n  - ')}`
    );
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    MONGODB_URI: rawMongoUri,
    CLIENT_URL: clientUrl,
    JWT: {
      ACCESS_SECRET: jwtAccessSecret,
      REFRESH_SECRET: jwtRefreshSecret,
      ACCESS_EXPIRES_IN: jwtAccessExpiresIn,
      REFRESH_EXPIRES_IN: jwtRefreshExpiresIn
    },
    ASTU_ALLOWED_EMAIL_DOMAINS: allowedEmailDomains,
    SMTP: {
      HOST: source.SMTP_HOST ? String(source.SMTP_HOST).trim() : '',
      PORT: source.SMTP_PORT ? Number(source.SMTP_PORT) : 587,
      USER: source.SMTP_USER ? String(source.SMTP_USER).trim() : '',
      PASS: source.SMTP_PASS ? String(source.SMTP_PASS) : '',
      FROM: source.EMAIL_FROM ? String(source.EMAIL_FROM).trim() : ''
    },
    CLOUDINARY: {
      CLOUD_NAME: source.CLOUDINARY_CLOUD_NAME ? String(source.CLOUDINARY_CLOUD_NAME).trim() : '',
      API_KEY: source.CLOUDINARY_API_KEY ? String(source.CLOUDINARY_API_KEY).trim() : '',
      API_SECRET: source.CLOUDINARY_API_SECRET ? String(source.CLOUDINARY_API_SECRET) : ''
    },
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test'
  };
};

// Evaluate configuration for active process environment
const config = validateEnv(process.env);

module.exports = config;
module.exports.validateEnv = validateEnv;
module.exports.config = config;
