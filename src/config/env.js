const dotenv = require('dotenv');

dotenv.config();

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19000',
  'http://127.0.0.1:19000',
  'http://localhost:19001',
  'http://127.0.0.1:19001',
  'http://localhost:19002',
  'http://127.0.0.1:19002'
];

const splitOrigins = (value) => {
  if (!value) return defaultCorsOrigins;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const resolveCors = () => {
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
  return splitOrigins(raw);
};

const corsOrigins = resolveCors();
const allowNoOrigin = process.env.CORS_ALLOW_NO_ORIGIN !== 'false';

const isOriginAllowed = (origin) => {
  if (!origin) return allowNoOrigin;
  if (corsOrigins.includes('*')) return true;
  return corsOrigins.includes(origin);
};

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/kinom',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtAdminSecret: process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminBootstrapEmail: process.env.ADMIN_EMAIL || process.env.ADMIN_BOOTSTRAP_EMAIL || '',
  adminBootstrapPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD || '',
  adminBootstrapName: process.env.ADMIN_NAME || 'Admin',
  corsOrigins,
  allowNoOrigin,
  isOriginAllowed,
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
