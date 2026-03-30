const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const health = asyncHandler(async (req, res) => {
  return sendSuccess(res, { status: 'ok', time: new Date().toISOString() });
});

module.exports = { health };
