const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Fallback secrets for local development if environment variables are not set
const DEFAULT_ACCESS_SECRET = 'engilab_access_token_dev_secret_key_32_chars!';
const DEFAULT_REFRESH_SECRET = 'engilab_refresh_token_dev_secret_key_32_chars!';

const getAccessSecret = () => env.JWT.ACCESS_SECRET || DEFAULT_ACCESS_SECRET;
const getRefreshSecret = () => env.JWT.REFRESH_SECRET || DEFAULT_REFRESH_SECRET;

/**
 * Generates a signed JWT Access Token for an authenticated user.
 *
 * @param {object} payload - Claims to embed in token (userId, role, department)
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: env.JWT.ACCESS_EXPIRES_IN || '15m'
  });
};

/**
 * Generates a signed JWT Refresh Token.
 *
 * @param {object} payload - Claims to embed in refresh token
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: env.JWT.REFRESH_EXPIRES_IN || '7d'
  });
};

/**
 * Verifies and decodes an access token.
 *
 * @param {string} token - JWT string
 * @returns {object} Decoded claims
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

/**
 * Verifies and decodes a refresh token.
 *
 * @param {string} token - JWT string
 * @returns {object} Decoded claims
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

/**
 * Configures secure, HTTP-only cookies containing authentication tokens.
 *
 * @param {object} res - Express response object
 * @param {string} accessToken - Access token string
 * @param {string} [refreshToken] - Refresh token string
 */
const sendTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = env.isProduction;

  // 15 minutes cookie for access token
  res.cookie('engilab_access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000
  });

  // 7 days cookie for refresh token if provided
  if (refreshToken) {
    res.cookie('engilab_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }
};

/**
 * Clears authentication cookies upon user logout.
 *
 * @param {object} res - Express response object
 */
const clearTokenCookies = (res) => {
  const isProduction = env.isProduction;
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  };

  res.clearCookie('engilab_access_token', cookieOptions);
  res.clearCookie('engilab_refresh_token', cookieOptions);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendTokenCookies,
  clearTokenCookies
};
