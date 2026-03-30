const rateLimit = require('express-rate-limit');
const { rateLimitWindowMs, rateLimitMax } = require('../config/env');

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limiter;
