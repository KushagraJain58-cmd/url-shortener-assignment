const rateLimit = require('express-rate-limit');

const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many URLs created from this IP, please try again after 15 minutes'
});

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many analytics requests from this IP, please try again after 15 minutes'
});

module.exports = {
  createUrlLimiter,
  analyticsLimiter
};