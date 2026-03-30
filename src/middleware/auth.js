const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const { jwtSecret, jwtAdminSecret } = require('../config/env');
const User = require('../models/User');
const Admin = require('../models/Admin');

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.replace('Bearer ', '').trim();
};

const authUser = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return sendError(res, 'Unauthorized', 401);

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'user') return sendError(res, 'Forbidden', 403);
    const user = await User.findById(payload.sub);
    if (!user) return sendError(res, 'Unauthorized', 401);
    req.user = user;
    return next();
  } catch (err) {
    return sendError(res, 'Unauthorized', 401);
  }
};

const authAdmin = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return sendError(res, 'Unauthorized', 401);

  try {
    const payload = jwt.verify(token, jwtAdminSecret);
    if (payload.role !== 'admin') return sendError(res, 'Forbidden', 403);
    const admin = await Admin.findById(payload.sub);
    if (!admin) return sendError(res, 'Unauthorized', 401);
    req.admin = admin;
    return next();
  } catch (err) {
    return sendError(res, 'Unauthorized', 401);
  }
};

const authAny = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return sendError(res, 'Unauthorized', 401);

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role !== 'user') throw new Error('Invalid role');
    const user = await User.findById(payload.sub);
    if (!user) return sendError(res, 'Unauthorized', 401);
    req.user = user;
    return next();
  } catch (err) {
    try {
      const payload = jwt.verify(token, jwtAdminSecret);
      if (payload.role !== 'admin') throw new Error('Invalid role');
      const admin = await Admin.findById(payload.sub);
      if (!admin) return sendError(res, 'Unauthorized', 401);
      req.admin = admin;
      return next();
    } catch (err2) {
      return sendError(res, 'Unauthorized', 401);
    }
  }
};

module.exports = { authUser, authAdmin, authAny };
