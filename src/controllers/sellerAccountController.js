const SellerAccount = require('../models/SellerAccount');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { sendMail, hasSmtpConfig } = require('../utils/mailer');
const normalizeStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'active') return 'available';
  if (status === 'inactive') return 'removed';
  return status || 'available';
};

const sanitizeAccount = (account) => {
  if (!account) return null;
  const source = typeof account.toObject === 'function' ? account.toObject() : account;
  return {
    _id: source._id,
    email: source.email || '',
    profileImage: source.profileImage || '',
    fullName: source.fullName || '',
    phoneNumber: source.phoneNumber || '',
    address: source.address || '',
    zipCode: source.zipCode || '',
    isVerified: Boolean(source.verified),
    verified: Boolean(source.verified),
    verifiedAt: source.verifiedAt || null,
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null,
    user: source.userId || source.user || null,
    userId: source.userId || source.user || null
  };
};

const formatProduct = (item) => {
  if (!item) return null;
  const source = typeof item.toObject === 'function' ? item.toObject() : item;
  const sellerAccount = source.sellerId
    ? sanitizeAccount(source.sellerId)
    : null;

  return {
    ...source,
    sellerAccount,
    sellerName: sellerAccount?.fullName || 'Unknown Seller',
    status: normalizeStatus(source.status)
  };
};

const requestOtp = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, address, zipCode, profileImage = '' } = req.body || {};
  if (!fullName || !phoneNumber || !address || !zipCode) {
    return sendError(res, 'fullName, phoneNumber, address, zipCode are required', 400);
  }

  const existingVerified = await SellerAccount.findOne({ userId: req.user._id, verified: true });
  if (existingVerified) {
    return sendSuccess(res, { alreadySeller: true, account: sanitizeAccount(existingVerified) });
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const account = await SellerAccount.findOneAndUpdate(
    { userId: req.user._id },
    {
      email: req.user.email,
      profileImage: String(profileImage || '').trim(),
      fullName,
      phoneNumber,
      address,
      zipCode,
      otpCode,
      otpExpiresAt,
      verified: false,
      verifiedAt: null
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
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
    {
      alreadySeller: false,
      account: sanitizeAccount(account),
      otpSent,
      devOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined
    },
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

  account.email = req.user.email;
  account.verified = true;
  account.verifiedAt = new Date();
  account.otpCode = '';
  account.otpExpiresAt = undefined;
  await account.save();

  return sendSuccess(
    res,
    { sellerVerified: true, account: sanitizeAccount(account) },
    'Verified'
  );
});

const ensure = asyncHandler(async (req, res) => {
  const account = await SellerAccount.findOne({ userId: req.user._id });
  if (!account) {
    return sendError(res, 'Seller account not found. Request OTP first.', 404);
  }
  if (!account.verified) {
    return sendError(res, 'Seller OTP not verified', 403);
  }
  return sendSuccess(res, { exists: true, account: sanitizeAccount(account) });
});

const me = asyncHandler(async (req, res) => {
  const account = await SellerAccount.findOne({ userId: req.user._id });
  if (!account) {
    return sendSuccess(res, {
      exists: false,
      account: null,
      pendingVerified: false,
      pendingVerifiedAt: null
    });
  }

  return sendSuccess(res, {
    exists: Boolean(account.verified),
    account: account.verified ? sanitizeAccount(account) : null,
    pendingVerified: Boolean(account.verified),
    pendingVerifiedAt: account.verifiedAt || null
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const account = await SellerAccount.findOne({ userId: req.user._id, verified: true });
  if (!account) return sendError(res, 'Seller account not found', 404);

  account.email = req.user.email;
  if (req.body.fullName !== undefined) account.fullName = String(req.body.fullName || '').trim();
  if (req.body.phoneNumber !== undefined) account.phoneNumber = String(req.body.phoneNumber || '').trim();
  if (req.body.address !== undefined) account.address = String(req.body.address || '').trim();
  if (req.body.zipCode !== undefined) account.zipCode = String(req.body.zipCode || '').trim();
  if (req.body.removeProfileImage) {
    account.profileImage = '';
  } else if (req.body.profileImage !== undefined) {
    account.profileImage = String(req.body.profileImage || '').trim();
  }

  if (!account.fullName || !account.phoneNumber || !account.address || !account.zipCode) {
    return sendError(res, 'fullName, phoneNumber, address, zipCode are required', 400);
  }

  await account.save();
  return sendSuccess(res, { account: sanitizeAccount(account) }, 'Updated');
});

const publicAccount = asyncHandler(async (req, res) => {
  let account = await SellerAccount.findById(req.params.id).select('-otpCode -otpExpiresAt').lean();

  if (!account) {
    account = await SellerAccount.findOne({ userId: req.params.id }).select('-otpCode -otpExpiresAt').lean();
  }

  if (!account) return sendError(res, 'Seller account not found', 404);

  const listedProducts = await Product.find({
    sellerId: account._id,
    status: { $nin: ['removed', 'inactive'] }
  })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('sellerId')
    .lean();

  const totalProducts = await Product.countDocuments({
    sellerId: account._id,
    status: { $nin: ['removed', 'inactive'] }
  });

  return sendSuccess(res, {
    seller: sanitizeAccount(account),
    stats: { totalProducts },
    products: listedProducts.map(formatProduct)
  });
});

module.exports = { requestOtp, verifyOtp, ensure, me, updateMe, publicAccount };
