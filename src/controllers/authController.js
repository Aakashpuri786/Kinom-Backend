const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { signUserToken } = require('../utils/token');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return sendError(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  const token = signUserToken(user);
  return sendSuccess(res, { token, user }, 'Registered');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return sendError(res, 'Invalid credentials', 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return sendError(res, 'Invalid credentials', 401);

  const token = signUserToken(user);
  return sendSuccess(res, { token, user }, 'Logged in');
});

const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: req.user });
});

module.exports = { register, login, me };
