const User = require('../models/User');
const SellerAccount = require('../models/SellerAccount');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeProductStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'active') return 'available';
  if (status === 'inactive') return 'removed';
  return status;
};

const overview = asyncHandler(async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));

  const [
    totalCustomers,
    usersAddedThisWeek,
    totalSellers,
    sellersAddedThisWeek,
    allProducts,
    weeklyUsersRaw
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    SellerAccount.countDocuments({ verified: true }),
    SellerAccount.countDocuments({ verified: true, createdAt: { $gte: sevenDaysAgo } }),
    Product.find({}).select('status').lean(),
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 }
        }
      }
    ])
  ]);

  const statuses = allProducts.map((item) => normalizeProductStatus(item.status));
  const totalProductsInSection = statuses.filter((status) => status !== 'removed').length;
  const availableProducts = statuses.filter((status) => status === 'available').length;
  const soldProducts = statuses.filter((status) => status === 'sold').length;

  const weeklyMap = new Map(
    weeklyUsersRaw.map((item) => {
      const key = `${item._id.y}-${String(item._id.m).padStart(2, '0')}-${String(item._id.d).padStart(2, '0')}`;
      return [key, Number(item.total || 0)];
    })
  );

  const weeklyUsers = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    weeklyUsers.push({
      key,
      label: day.toLocaleDateString([], { weekday: 'short' }),
      date: day.toISOString(),
      total: weeklyMap.get(key) || 0
    });
  }

  return sendSuccess(res, {
    stats: {
      totalProductsInSection,
      availableProducts,
      soldProducts,
      totalCustomers,
      usersAddedThisWeek,
      totalSellers,
      sellersAddedThisWeek
    },
    weeklyUsers
  });
});

module.exports = { overview };
