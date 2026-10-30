const ApiError = require('../utils/apiError');

/**
 * Reusable input validation rules and checkers for EngiLab API.
 */
const validators = {
  isEmail: (val) => {
    if (typeof val !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  },

  isNonEmptyString: (val, minLength = 1) => {
    return typeof val === 'string' && val.trim().length >= minLength;
  },

  isStrongPassword: (val) => {
    // Minimum 6 characters for academic platform usability
    return typeof val === 'string' && val.length >= 6;
  },

  isMongoId: (val) => {
    if (typeof val !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(val.trim());
  },

  isOneOf: (val, allowedValues) => {
    return allowedValues.includes(val);
  }
};

/**
 * Higher-order middleware factory that validates request payloads.
 * Accepts a validation function that returns an array of error objects: [{ field, message }].
 *
 * @param {Function} validatorFn - Function receiving req (body, query, params) and returning errors array
 * @returns {Function} Express middleware function
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    try {
      const errors = validatorFn(req);
      if (Array.isArray(errors) && errors.length > 0) {
        const primaryMessage = errors[0]?.message || 'Validation failed';
        return next(new ApiError(400, primaryMessage, errors));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

module.exports = validate;
module.exports.validate = validate;
module.exports.validators = validators;
