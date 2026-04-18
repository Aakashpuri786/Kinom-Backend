const SellerAccount = require('../models/SellerAccount');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { sendMail, hasSmtpConfig } = require('../utils/mailer');
const { sanitizeSellerAccount, sanitizePublicSellerAccount } = require('../utils/serializers');

const requestOtp = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, address, zipCode } = req.body || {};
  if (!fullName || !phoneNumber || !address || !zipCode) {
    return sendError(res, 'fullName, phoneNumber, address, zipCode are required', 400);
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const account = await SellerAccount.findOneAndUpdate(
    { userId: req.user._id },
    { fullName, phoneNumber, address, zipCode, otpCode, otpExpiresAt },
    { new: true, upsert: true }
  );

  let otpSent = false;
  if (req.user && req.user.email && hasSmtpConfig()) {
    try {
      otpSent = await sendMail({
        to: req.user.email,
        subject: 'Your Kinom OTP Code',
        text: `Your OTP code is ${otpCode}. It expires in 10 minutes.`
      });
    } catch (err) {
      console.error('Failed to send OTP email', err);
    }
  }

  return sendSuccess(
    res,
    { sellerAccount: sanitizeSellerAccount(account), otpSent },
    'OTP sent'
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body || {};
  if (!otp) return sendError(res, 'otp is required', 400);

  const account = await SellerAccount.findOne({ userId: req.user._id });
  if (!account) return sendError(res, 'Seller account not found', 404);

  if (account.otpCode !== otp || !account.otpExpiresAt || account.otpExpiresAt < new Date()) {
    return sendError(res, 'Invalid or expired OTP', 400);
  }

  account.verified = true;
  account.otpCode = '';
  account.otpExpiresAt = undefined;
  await account.save();

  return sendSuccess(res, { sellerAccount: sanitizeSellerAccount(account) }, 'Verified');
});

const ensure = asyncHandler(async (req, res) => {
  let account = await SellerAccount.findOne({ userId: req.user._id });
  if (!account) {
    return sendError(res, 'Seller account not found. Request OTP first.', 404);
  }
  return sendSuccess(res, { sellerAccount: sanitizeSellerAccount(account) });
});

const me = asyncHandler(async (req, res) => {
  const account = await SellerAccount.findOne({ userId: req.user._id });
  if (!account) return sendError(res, 'Seller account not found', 404);
  return sendSuccess(res, { sellerAccount: sanitizeSellerAccount(account) });
});

const publicAccount = asyncHandler(async (req, res) => {
  const account = await SellerAccount.findById(req.params.id).select('-otpCode -otpExpiresAt');
  if (!account) return sendError(res, 'Seller account not found', 404);
  return sendSuccess(res, { sellerAccount: sanitizePublicSellerAccount(account) });
});

module.exports = { requestOtp, verifyOtp, ensure, me, publicAccount };
