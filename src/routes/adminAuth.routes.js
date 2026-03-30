const express = require('express');
const { login, verify, me } = require('../controllers/adminAuthController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/verify', verify);
router.get('/me', authAdmin, me);

module.exports = router;
