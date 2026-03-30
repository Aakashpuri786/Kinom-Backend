const express = require('express');
const { overview } = require('../controllers/dashboardController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', authUser, overview);

module.exports = router;
