const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const health = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return sendSuccess(res, { 
    status: 'okay', 
    database: dbStatus,
    time: new Date().toISOString() 
  });
});

module.exports = { health };
