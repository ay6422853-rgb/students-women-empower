const User = require("../models/User");
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const CashTransaction = require("../models/CashTransaction");


// ========================================
// TEAM LEADER DASHBOARD
// ========================================

async function dashboard(req, res) {
  try {

    // ====================================
    // ONLY TEAM LEADER
    // ====================================

    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Only Team Leader can access dashboard"
      });
    }

    const teamLeaderId = req.user.id;


    // ====================================
    // TEAM MEMBERS
    // ====================================

    const members = await User.find({
      referredBy: teamLeaderId,
      role: "MEMBER"
    })
      .select(
        "name email phone city district state status referralCode createdAt"
      )
      .sort({
        createdAt: -1
      });


    // ====================================
    // STOCK
    // ====================================

    const stock = await Stock.findOne({
      owner: teamLeaderId
    }).populate({
      path: "items.product",
      select:
        "name sku price images lowStockThreshold status"
    });


    const stockItems = stock?.items || [];

    let totalProducts = 0;
    let totalUnits = 0;
    let lowStock = 0;
    let outOfStock = 0;

    stockItems.forEach((item) => {

      const quantity =
        Number(item.quantity || 0);

      const product =
        item.product;

      if (!product) return;

      totalProducts++;

      totalUnits += quantity;

      const threshold =
        Number(
          product.lowStockThreshold || 0
        );

      if (quantity <= 0) {

        outOfStock++;

      } else if (
        threshold > 0 &&
        quantity <= threshold
      ) {

        lowStock++;
      }
    });


    // ====================================
    // ORDERS
    // ====================================

    const orders = await Order.find({
      seller: teamLeaderId
    })
      .populate(
        "buyer",
        "name email phone"
      )
      .populate(
        "items.product",
        "name sku"
      )
      .sort({
        createdAt: -1
      });


    const confirmedOrders =
      orders.filter(
        (order) =>
          order.status === "CONFIRMED"
      );


    const totalSales =
      confirmedOrders.reduce(
        (total, order) =>
          total +
          Number(order.totalAmount || 0),
        0
      );


    // ====================================
    // CASH COLLECTION
    // ====================================

    const collections =
      await CashTransaction.find({
        to: teamLeaderId,
        type:
          "MEMBER_TO_TEAM_LEADER"
      });


    const totalCollected =
      collections.reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );


    // ====================================
    // CASH TRANSFERS
    // ====================================

    const transfers =
      await CashTransaction.find({
        from: teamLeaderId,
        type:
          "TEAM_LEADER_TO_CASH_MANAGER"
      });


    const totalTransferred =
      transfers
        .filter(
          (transaction) =>
            transaction.status ===
            "APPROVED"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        );


    const pendingTransfer =
      transfers
        .filter(
          (transaction) =>
            transaction.status ===
            "SUBMITTED"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        );


    // ====================================
    // CASH BALANCE
    // ====================================

    const cashBalance =
      totalCollected -
      totalTransferred;


    // ====================================
    // RESPONSE
    // ====================================

    res.json({

      dashboard: {

        team: {
          totalMembers: members.length,
          activeMembers:
            members.filter(
              (member) =>
                member.status === "ACTIVE"
            ).length,
          inactiveMembers:
            members.filter(
              (member) =>
                member.status !== "ACTIVE"
            ).length
        },


        stock: {
          totalProducts,
          totalUnits,
          lowStock,
          outOfStock
        },


        sales: {
          totalOrders: orders.length,
          confirmedOrders:
            confirmedOrders.length,
          totalSales
        },


        cash: {
          totalCollected,
          totalTransferred,
          pendingTransfer,
          cashBalance
        },


        recentMembers:
          members.slice(0, 10),


        recentOrders:
          orders.slice(0, 10)

      }

    });

  } catch (error) {

    console.error(
      "Team Leader dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load Team Leader dashboard"
    });
  }
}


// ========================================
// EXPORT
// ========================================

module.exports = {
  dashboard
};