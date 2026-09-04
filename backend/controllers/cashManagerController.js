const CashTransaction = require("../models/CashTransaction");

const {
  pendingTransfers,
  approveTransfer,
  rejectTransfer,
  getCashManagerWallet
} = require("./cashController");

// ======================================================
// CASH MANAGER
// LIST CASH TRANSFERS
// ======================================================
// Existing frontend compatibility ke liye ye function
// rakha gaya hai.
//
// Actual data/approval logic cashController se aayega.
// ======================================================

async function listCashTransfers(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message:
          "Only Cash Manager can view cash transfers"
      });
    }

    const transactions =
      await CashTransaction.find({
        to: req.user.id,
        type:
          "TEAM_LEADER_TO_CASH_MANAGER"
      })
        .populate(
          "from",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        });

    return res.json({
      transactions
    });
  } catch (error) {
    console.error(
      "List Cash Manager transfers error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load cash transfers"
    });
  }
}

// ======================================================
// CASH MANAGER
// UPDATE CASH TRANSFER
// ======================================================
// Existing endpoint:
//
// PATCH /cash-manager/transfers/:id
//
// body:
// {
//   "status": "APPROVED"
// }
//
// OR
//
// {
//   "status": "REJECTED"
// }
//
// Actual approval/rejection cashController ke
// canonical functions se hoga.
// ======================================================

async function updateCashTransfer(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message:
          "Only Cash Manager can update cash transfer"
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message:
          "Status is required"
      });
    }

    const normalizedStatus =
      String(status).toUpperCase();

    // --------------------------------------------------
    // APPROVE
    // --------------------------------------------------

    if (normalizedStatus === "APPROVED") {
      return approveTransfer(req, res);
    }

    // --------------------------------------------------
    // REJECT
    // --------------------------------------------------

    if (normalizedStatus === "REJECTED") {
      return rejectTransfer(req, res);
    }

    return res.status(400).json({
      message:
        "Status must be APPROVED or REJECTED"
    });
  } catch (error) {
    console.error(
      "Update Cash Manager transfer error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to update cash transfer"
    });
  }
}

// ======================================================
// CASH MANAGER WALLET
// ======================================================
// Existing frontend compatibility ke liye.
// ======================================================

async function getMyCashWallet(req, res) {
  return getCashManagerWallet(req, res);
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  listCashTransfers,
  updateCashTransfer,
  getMyCashWallet
};