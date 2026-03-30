const dotenv = require('dotenv');

dotenv.config();

const splitOrigins = (value) => {
  if (!value) return ['*'];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const resolveCors = () => {
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
  return splitOrigins(raw);
};

module.exports = {
  port: process.env.PORT || 5002,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/kinom',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtAdminSecret: process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminBootstrapEmail: process.env.ADMIN_EMAIL || process.env.ADMIN_BOOTSTRAP_EMAIL || '',
  adminBootstrapPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD || '',
  adminBootstrapName: process.env.ADMIN_NAME || 'Admin',
  corsOrigins: resolveCors(),
  baseUrl: process.env.BASE_URL || '',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || ''
};
