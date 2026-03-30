const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authUser, me);

module.exports = router;
