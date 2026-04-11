const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const routes = require('./routes');
const limiter = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');
const { isOriginAllowed, uploadDir } = require('./config/env');

const app = express();

app.set('json spaces', 2);

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
};

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiter);

app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
