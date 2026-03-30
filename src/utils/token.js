const jwt = require('jsonwebtoken');
const { jwtSecret, jwtAdminSecret, jwtExpiresIn } = require('../config/env');

const signUserToken = (user) => {
  return jwt.sign({ sub: user._id.toString(), role: 'user' }, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
};

const signAdminToken = (admin) => {
  return jwt.sign({ sub: admin._id.toString(), role: 'admin' }, jwtAdminSecret, {
    expiresIn: jwtExpiresIn
  });
};

module.exports = { signUserToken, signAdminToken };
