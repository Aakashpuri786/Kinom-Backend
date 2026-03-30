const getPagination = (req, defaultLimit = 20) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

module.exports = { getPagination };
