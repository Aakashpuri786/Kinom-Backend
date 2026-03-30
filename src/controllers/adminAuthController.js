const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { signAdminToken } = require('../utils/token');
const { adminBootstrapEmail, adminBootstrapPassword, adminBootstrapName } = require('../config/env');

const ensureBootstrapAdmin = async (email, password) => {
  if (!adminBootstrapEmail || !adminBootstrapPassword) return null;
  if (email.toLowerCase() !== adminBootstrapEmail.toLowerCase()) return null;
  if (password !== adminBootstrapPassword) return null;

  const existing = await Admin.findOne({ email: adminBootstrapEmail.toLowerCase() });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(adminBootstrapPassword, 10);
  const admin = await Admin.create({
    name: adminBootstrapName || 'Admin',
    email: adminBootstrapEmail.toLowerCase(),
    passwordHash,
    permissions: ['*']
  });
  return admin;
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  let admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    admin = await ensureBootstrapAdmin(email, password);
  }
  if (!admin) return sendError(res, 'Invalid credentials', 401);

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return sendError(res, 'Invalid credentials', 401);

  const token = signAdminToken(admin);
  return sendSuccess(res, { token, admin }, 'Logged in');
});

const verify = asyncHandler(async (req, res) => {
  const { code } = req.body || {};
  if (!code) return sendError(res, 'Verification code required', 400);
  return sendSuccess(res, { verified: true }, 'Verified');
});

const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { admin: req.admin });
});

module.exports = { login, verify, me };
