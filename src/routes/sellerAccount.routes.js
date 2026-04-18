const express = require('express');
const {
  requestOtp,
  verifyOtp,
  ensure,
  me,
  updateMe,
  publicAccount
} = require('../controllers/sellerAccountController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/request-otp', authUser, requestOtp);
router.post('/verify-otp', authUser, verifyOtp);
router.post('/ensure', authUser, ensure);
router.get('/me', authUser, me);
router.patch('/me', authUser, updateMe);
router.get('/public/:id', publicAccount);

module.exports = router;
