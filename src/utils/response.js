const sendSuccess = (res, data = {}, message = '') => {
  const payload = { success: true, data };
  if (message) payload.message = message;
  return res.status(200).json(payload);
};

const sendError = (res, message = 'Error', status = 500, data) => {
  const payload = { success: false, message };
  if (data) payload.data = data;
  return res.status(status).json(payload);
};

module.exports = { sendSuccess, sendError };
