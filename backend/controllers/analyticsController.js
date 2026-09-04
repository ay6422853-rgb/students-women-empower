const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Commission = require("../models/Commission");

async function dashboard(req, res) {
  const [users, activeUsers, products, orders, revenueAgg, commissions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "ACTIVE" }),
    Product.countDocuments(),
    Order.countDocuments({ status: "CONFIRMED" }),
    Order.aggregate([{ $match: { status: "CONFIRMED" } }, { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }]),
    Commission.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);

  res.json({
    users,
    activeUsers,
    products,
    confirmedOrders: orders,
    revenue: revenueAgg[0]?.revenue || 0,
    commissions: commissions[0]?.total || 0
  });
}

module.exports = { dashboard };
