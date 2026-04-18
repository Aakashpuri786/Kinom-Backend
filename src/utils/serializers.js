const toPlainObject = (value) => {
  if (!value) return null;
  if (typeof value.toObject === 'function') return value.toObject();
  return value;
};

const pick = (value, keys) => {
  const source = toPlainObject(value);
  if (!source) return null;

  return keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
};

const sanitizeUser = (user) =>
  pick(user, ['_id', 'name', 'email', 'role', 'profile', 'createdAt', 'updatedAt']);

const sanitizeAdmin = (admin) =>
  pick(admin, ['_id', 'name', 'email', 'permissions', 'createdAt', 'updatedAt']);

const sanitizeSellerAccount = (account) =>
  pick(account, [
    '_id',
    'userId',
    'fullName',
    'phoneNumber',
    'address',
    'zipCode',
    'verified',
    'createdAt',
    'updatedAt'
  ]);

const sanitizePublicSellerAccount = (account) =>
  pick(account, ['_id', 'fullName', 'verified', 'createdAt', 'updatedAt']);

module.exports = {
  sanitizeUser,
  sanitizeAdmin,
  sanitizeSellerAccount,
  sanitizePublicSellerAccount
};
