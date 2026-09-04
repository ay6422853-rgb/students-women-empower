const Commission = require("../models/Commission");

const {
  payCommission,
  getOrderCommissionSummary
} = require("../services/commissionService");

// ======================================================
// LIST COMMISSIONS
// ======================================================

async function listCommissions(req, res) {
  try {
    let filter = {};

    // MEMBER / TEAM LEADER / OTHER USERS:
    // only their own commissions
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN" &&
      req.user.role !== "CASH_MANAGER"
    ) {
      filter = {
        beneficiary: req.user.id
      };
    }

    // Cash Manager can see commissions that are payable
    // Admin can see all commissions
    const commissions = await Commission.find(filter)
      .populate(
        "beneficiary",
        "name email phone role"
      )
      .populate(
        "sourceUser",
        "name email phone role"
      )
      .populate(
        "order",
        "total status paymentStatus createdAt"
      )
      .sort({
        createdAt: -1
      });

    return res.json({
      commissions
    });
  } catch (error) {
    console.error(
      "List commissions error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load commissions"
    });
  }
}

// ======================================================
// CASH MANAGER → PAY COMMISSION
// ======================================================

async function payCommissionController(req, res) {
  try {
    // --------------------------------------------------
    // Only Cash Manager should normally pay commission.
    // Admin/Super Admin are kept for administrative control.
    // --------------------------------------------------

    if (
      ![
        "CASH_MANAGER",
        "ADMIN",
        "SUPER_ADMIN"
      ].includes(req.user.role)
    ) {
      return res.status(403).json({
        message:
          "Only Cash Manager or Admin can pay commission"
      });
    }

    // --------------------------------------------------
    // Pay commission using Cash Manager's cash wallet
    // --------------------------------------------------

    const commission =
      await payCommission(
        req.params.id,
        req.user.id
      );

    return res.json({
      message:
        "Commission paid successfully",
      commission
    });
  } catch (error) {
    console.error(
      "Pay commission controller error:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Unable to pay commission"
    });
  }
}

// ======================================================
// ORDER COMMISSION SUMMARY
// ======================================================
// Admin / Cash Manager can use this to see:
//
// Total commission
// Pending commission
// Available commission
// Paid commission
// ======================================================

async function orderCommissionSummary(
  req,
  res
) {
  try {
    if (
      ![
        "ADMIN",
        "SUPER_ADMIN",
        "CASH_MANAGER"
      ].includes(req.user.role)
    ) {
      return res.status(403).json({
        message:
          "Only Cash Manager or Admin can view order commission summary"
      });
    }

    const summary =
      await getOrderCommissionSummary(
        req.params.orderId
      );

    return res.json(summary);
  } catch (error) {
    console.error(
      "Order commission summary error:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Unable to load commission summary"
    });
  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  listCommissions,
  payCommissionController,
  orderCommissionSummary
};