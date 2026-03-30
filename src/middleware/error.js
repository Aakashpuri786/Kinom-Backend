const { sendError } = require('../utils/response');
const { nodeEnv } = require('../config/env');

const notFound = (req, res) => {
  return sendError(res, 'Not Found', 404);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = err.message || 'Server error';

  if (nodeEnv !== 'test') {
    console.error(err);
  }

  return sendError(res, message, status);
};

module.exports = { notFound, errorHandler };
