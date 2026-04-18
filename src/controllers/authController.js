const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { signUserToken } = require('../utils/token');
const { sanitizeUser } = require('../utils/serializers');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return sendError(res, 'Name, email, and password are required', 400);
  }

  if (!isValidEmail(email)) return sendError(res, 'Valid email is required', 400);
  if (String(password).length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return sendError(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: String(name).trim(), email: email.toLowerCase(), passwordHash });
  const token = signUserToken(user);
  return sendSuccess(res, { token, user: sanitizeUser(user) }, 'Registered');
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
  return sendSuccess(res, { token, user: sanitizeUser(user) }, 'Logged in');
});

const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: sanitizeUser(req.user) });
});

module.exports = { register, login, me };
