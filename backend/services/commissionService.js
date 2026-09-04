const Commission = require("../models/Commission");
const Wallet = require("../models/Wallet");
const CashWallet = require("../models/CashWallet");
const User = require("../models/User");

// ======================================================
// COMMISSION STRUCTURE
// ======================================================

const COMMISSION_LEVELS = [
  { level: 1, rate: 5 },
  { level: 2, rate: 3 },
  { level: 3, rate: 2 },
  { level: 4, rate: 1 }
];

// ======================================================
// CREATE COMMISSIONS FOR CONFIRMED ORDER
// ======================================================
//
// Order CONFIRMED hote hi:
//
// Level 1 = 5%
// Level 2 = 3%
// Level 3 = 2%
// Level 4 = 1%
//
// Commission status = AVAILABLE
//
// Beneficiary ke commission Wallet mein amount
// immediately credit hoga.
//
// IMPORTANT:
// Ye actual CASH PAYMENT nahi hai.
//
// Actual cash payment baad mein Cash Manager karega.
// ======================================================

async function createCommissionsForOrder(order) {
  try {
    if (!order || !order._id || !order.buyer) {
      return [];
    }

    // --------------------------------------------------
    // Prevent duplicate commissions
    // --------------------------------------------------

    const existing = await Commission.findOne({
      order: order._id
    });

    if (existing) {
      return Commission.find({
        order: order._id
      }).sort({
        level: 1
      });
    }

    // --------------------------------------------------
    // Order total
    // --------------------------------------------------

    const totalAmount = Number(
      order.total || 0
    );

    if (totalAmount <= 0) {
      return [];
    }

    // --------------------------------------------------
    // Find buyer
    // --------------------------------------------------

    let currentUser =
      await User.findById(
        order.buyer
      ).select(
        "_id referredBy name role status"
      );

    if (!currentUser) {
      return [];
    }

    const createdCommissions = [];

    // --------------------------------------------------
    // Traverse referral chain
    // --------------------------------------------------

    for (
      const levelConfig of COMMISSION_LEVELS
    ) {
      if (!currentUser.referredBy) {
        break;
      }

      const referrer =
        await User.findById(
          currentUser.referredBy
        ).select(
          "_id referredBy name role status"
        );

      if (!referrer) {
        break;
      }

      const amount =
        (
          totalAmount *
          levelConfig.rate
        ) / 100;

      if (amount > 0) {

        // ------------------------------------------------
        // Commission immediately AVAILABLE
        // ------------------------------------------------

        const commission =
          await Commission.create({
            beneficiary:
              referrer._id,

            sourceUser:
              order.buyer,

            order:
              order._id,

            level:
              levelConfig.level,

            rate:
              levelConfig.rate,

            amount,

            status:
              "AVAILABLE"
          });

        createdCommissions.push(
          commission
        );

        // ------------------------------------------------
        // Credit beneficiary commission wallet
        // ------------------------------------------------

        await Wallet.findOneAndUpdate(
          {
            user:
              referrer._id
          },
          {
            $inc: {
              availableBalance:
                amount,

              totalEarnings:
                amount
            }
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
          }
        );
      }

      // Move to next referral level
      currentUser = referrer;
    }

    console.log(
      `Created ${createdCommissions.length} AVAILABLE commission(s) for order ${order._id}`
    );

    return createdCommissions;
  } catch (error) {
    console.error(
      "Create commission error:",
      error
    );

    throw error;
  }
}

// ======================================================
// PAY COMMISSION
// ======================================================
//
// Cash Manager pays actual cash.
//
// Cash Manager CashWallet
//          ↓
//       Commission
//          ↓
//    Beneficiary/User
//
// Commission Wallet already contains the payable
// entitlement, so actual payment reduces:
//
// Beneficiary Wallet.availableBalance
//
// Cash Manager CashWallet.availableBalance is also
// reduced by the same amount.
//
// ======================================================

async function payCommission(
  commissionId,
  cashManagerId
) {
  try {
    if (!commissionId) {
      throw new Error(
        "Commission ID is required"
      );
    }

    if (!cashManagerId) {
      throw new Error(
        "Cash Manager ID is required"
      );
    }

    // --------------------------------------------------
    // Find AVAILABLE commission
    // --------------------------------------------------

    const commission =
      await Commission.findOne({
        _id: commissionId,
        status: "AVAILABLE"
      });

    if (!commission) {
      throw new Error(
        "Available commission not found"
      );
    }

    const amount =
      Number(
        commission.amount || 0
      );

    if (amount <= 0) {
      throw new Error(
        "Invalid commission amount"
      );
    }

    // --------------------------------------------------
    // Cash Manager wallet
    // --------------------------------------------------

    const cashManagerWallet =
      await CashWallet.findOne({
        user:
          cashManagerId
      });

    if (!cashManagerWallet) {
      throw new Error(
        "Cash Manager cash wallet not found"
      );
    }

    // --------------------------------------------------
    // Check Cash Manager cash
    // --------------------------------------------------

    if (
      Number(
        cashManagerWallet.availableBalance || 0
      ) < amount
    ) {
      throw new Error(
        "Insufficient Cash Manager cash balance"
      );
    }

    // --------------------------------------------------
    // Beneficiary commission wallet
    // --------------------------------------------------

    const beneficiaryWallet =
      await Wallet.findOne({
        user:
          commission.beneficiary
      });

    if (!beneficiaryWallet) {
      throw new Error(
        "Beneficiary commission wallet not found"
      );
    }

    if (
      Number(
        beneficiaryWallet.availableBalance || 0
      ) < amount
    ) {
      throw new Error(
        "Beneficiary commission balance is insufficient"
      );
    }

    // --------------------------------------------------
    // Deduct cash from Cash Manager
    // --------------------------------------------------

    cashManagerWallet.availableBalance -=
      amount;

    await cashManagerWallet.save();

    // --------------------------------------------------
    // Mark beneficiary commission as paid
    // --------------------------------------------------

    beneficiaryWallet.availableBalance -=
      amount;

    beneficiaryWallet.totalWithdrawn =
      Number(
        beneficiaryWallet.totalWithdrawn || 0
      ) + amount;

    await beneficiaryWallet.save();

    // --------------------------------------------------
    // Commission PAID
    // --------------------------------------------------

    commission.status =
      "PAID";

    await commission.save();

    console.log(
      `Commission ₹${amount} paid by Cash Manager ${cashManagerId} to beneficiary ${commission.beneficiary}`
    );

    return commission;
  } catch (error) {
    console.error(
      "Pay commission error:",
      error
    );

    throw error;
  }
}

// ======================================================
// GET COMMISSION SUMMARY FOR AN ORDER
// ======================================================

async function getOrderCommissionSummary(
  orderId
) {
  try {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const commissions =
      await Commission.find({
        order: orderId
      })
        .populate(
          "beneficiary",
          "name email phone role"
        )
        .populate(
          "sourceUser",
          "name email phone role"
        )
        .sort({
          level: 1
        });

    const totalCommission =
      commissions.reduce(
        (
          sum,
          commission
        ) =>
          sum +
          Number(
            commission.amount || 0
          ),
        0
      );

    const availableAmount =
      commissions
        .filter(
          commission =>
            commission.status ===
            "AVAILABLE"
        )
        .reduce(
          (
            sum,
            commission
          ) =>
            sum +
            Number(
              commission.amount || 0
            ),
          0
        );

    const paidAmount =
      commissions
        .filter(
          commission =>
            commission.status ===
            "PAID"
        )
        .reduce(
          (
            sum,
            commission
          ) =>
            sum +
            Number(
              commission.amount || 0
            ),
          0
        );

    return {
      orderId,

      totalCommission,

      pendingAmount: 0,

      availableAmount,

      paidAmount,

      remainingPercentage: 89,

      commissions
    };
  } catch (error) {
    console.error(
      "Get order commission summary error:",
      error
    );

    throw error;
  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  COMMISSION_LEVELS,
  createCommissionsForOrder,
  payCommission,
  getOrderCommissionSummary
};