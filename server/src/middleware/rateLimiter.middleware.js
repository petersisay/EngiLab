const ApiError = require('../utils/apiError');

/**
 * In-memory sliding-window rate limiter for EngiLab API endpoints.
 * Protects against brute-force attacks and denial-of-service abuse without external store requirements.
 *
 * @param {object} options - Configuration options
 * @param {number} [options.windowMs=900000] - Window duration in milliseconds (default: 15 minutes)
 * @param {number} [options.max=100] - Max requests allowed per client IP within windowMs
 * @param {string} [options.message='Too many requests, please try again later.'] - Error message
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const windowMs = typeof options.windowMs === 'number' ? options.windowMs : 15 * 60 * 1000;
  const max = typeof options.max === 'number' ? options.max : 100;
  const message = options.message || 'Too many requests, please try again later.';

  // In-memory hit storage: Map<ip, { count: number, resetTime: number }>
  const hits = new Map();

  // Periodic cleanup of expired entries every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Determine client IP safely
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = (forwarded ? String(forwarded).split(',')[0].trim() : req.socket?.remoteAddress) || '127.0.0.1';

    const now = Date.now();
    const record = hits.get(clientIp);

    if (!record || now > record.resetTime) {
      hits.set(clientIp, {
        count: 1,
        resetTime: now + windowMs
      });

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return next(new ApiError(429, message));
    }

    return next();
  };
};

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Sensitive Auth route limiter (15 requests per 15 minutes)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter
};
