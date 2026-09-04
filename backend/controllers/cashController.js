const CashTransaction = require("../models/CashTransaction");
const CashWallet = require("../models/CashWallet");
const Order = require("../models/Order");
const User = require("../models/User");

// ======================================================
// HELPERS
// ======================================================

function getUserId(req) {
  return req.user?.id || req.user?._id;
}

function isValidAmount(amount) {
  return (
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0
  );
}

async function getOrCreateCashWallet(userId) {
  if (!userId) {
    throw new Error("User ID is required for cash wallet");
  }

  let wallet = await CashWallet.findOne({
    user: userId,
  });

  if (!wallet) {
    wallet = await CashWallet.create({
      user: userId,
      availableBalance: 0,
      pendingBalance: 0,
      totalCollected: 0,
      totalReceived: 0,
      totalTransferred: 0,
    });
  }

  return wallet;
}

// ======================================================
// TEAM LEADER - COLLECT CASH
// ======================================================

async function collectCash(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Only Team Leader can collect cash",
      });
    }

    const {
      orderId,
      cashAmount,
      amount,
      note,
    } = req.body;

    const finalAmount = cashAmount ?? amount;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    if (!isValidAmount(finalAmount)) {
      return res.status(400).json({
        message: "Invalid cash amount",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      String(order.seller) !==
      String(getUserId(req))
    ) {
      return res.status(403).json({
        message: "You are not the seller of this order",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cancelled order cannot receive cash",
      });
    }

    if (order.status === "CONFIRMED") {
      return res.status(400).json({
        message: "Confirmed order cannot receive cash",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "Cash has already been collected",
      });
    }

    const orderTotal = Number(order.total || 0);

    if (Number(finalAmount) !== orderTotal) {
      return res.status(400).json({
        message:
          `Cash amount must be exactly ₹${orderTotal}`,
      });
    }

    const existing =
      await CashTransaction.findOne({
        order: order._id,
        type: "MEMBER_TO_TEAM_LEADER",
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Cash has already been collected for this order",
      });
    }

    const transaction =
      await CashTransaction.create({
        order: order._id,
        from: order.buyer,
        to: getUserId(req),
        amount: Number(finalAmount),
        type: "MEMBER_TO_TEAM_LEADER",
        status: "APPROVED",
        note:
          note ||
          "Cash collected by Team Leader",
      });

    const wallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    wallet.availableBalance =
      Number(wallet.availableBalance || 0) +
      Number(finalAmount);

    wallet.totalCollected =
      Number(wallet.totalCollected || 0) +
      Number(finalAmount);

    await wallet.save();

    order.paymentStatus = "PAID";

    await order.save();

    return res.json({
      message: "Cash collected successfully",
      transaction,
      cashWallet: wallet,
    });
  } catch (error) {
    console.error(
      "Cash collection error:",
      error
    );

    return res.status(500).json({
      message: "Unable to collect cash",
      error: error.message,
    });
  }
}

// ======================================================
// TEAM LEADER - MY COLLECTIONS
// ======================================================

async function myCollections(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const transactions =
      await CashTransaction.find({
        to: getUserId(req),
        type: "MEMBER_TO_TEAM_LEADER",
      })
        .populate(
          "from",
          "name email phone role"
        )
        .populate(
          "order",
          "total status paymentStatus createdAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "My collections error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load collections",
      error: error.message,
    });
  }
}

// ======================================================
// TEAM LEADER - MY WALLET
// ======================================================

async function getMyCashWallet(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const wallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    return res.json({
      cashWallet: wallet,
      wallet,
    });
  } catch (error) {
    console.error(
      "Get TL cash wallet error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load cash wallet",
      error: error.message,
    });
  }
}

// ======================================================
// TEAM LEADER - LIST CASH MANAGERS
// ======================================================

async function listCashManagers(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const cashManagers =
      await User.find({
        role: "CASH_MANAGER",
        status: "ACTIVE",
      })
        .select(
          "_id name email phone mobile role status"
        )
        .sort({
          name: 1,
        });

    return res.json({
      cashManagers,
      users: cashManagers,
    });
  } catch (error) {
    console.error(
      "List cash managers error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load Cash Managers",
      error: error.message,
    });
  }
}

// ======================================================
// TEAM LEADER - TRANSFER CASH TO CASH MANAGER
// ======================================================

async function transferCash(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message:
          "Only Team Leader can transfer cash",
      });
    }

    const {
      cashManagerId,
      amount,
      note,
    } = req.body;

    if (!cashManagerId) {
      return res.status(400).json({
        message: "Cash Manager is required",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message: "Invalid transfer amount",
      });
    }

    const cashManager =
      await User.findOne({
        _id: cashManagerId,
        role: "CASH_MANAGER",
        status: "ACTIVE",
      });

    if (!cashManager) {
      return res.status(400).json({
        message:
          "Cash Manager not found or inactive",
      });
    }

    const transferAmount = Number(amount);

    const teamLeaderWallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    if (
      Number(
        teamLeaderWallet.availableBalance || 0
      ) < transferAmount
    ) {
      return res.status(400).json({
        message:
          "Insufficient available cash balance",
      });
    }

    teamLeaderWallet.availableBalance -=
      transferAmount;

    teamLeaderWallet.pendingBalance =
      Number(
        teamLeaderWallet.pendingBalance || 0
      ) + transferAmount;

    await teamLeaderWallet.save();

    const transaction =
      await CashTransaction.create({
        from: getUserId(req),
        to: cashManager._id,
        amount: transferAmount,
        type:
          "TEAM_LEADER_TO_CASH_MANAGER",
        status: "SUBMITTED",
        note:
          note ||
          "Cash transfer submitted to Cash Manager",
      });

    return res.status(201).json({
      message:
        "Cash transfer submitted successfully",
      transaction,
      cashWallet: teamLeaderWallet,
    });
  } catch (error) {
    console.error(
      "Transfer cash error:",
      error
    );

    return res.status(500).json({
      message: "Unable to transfer cash",
      error: error.message,
    });
  }
}

// ======================================================
// TEAM LEADER - MY TRANSFERS
// ======================================================

async function myTransfers(req, res) {
  try {
    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const transactions =
      await CashTransaction.find({
        from: getUserId(req),
        type:
          "TEAM_LEADER_TO_CASH_MANAGER",
      })
        .populate(
          "to",
          "name email phone role"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "My transfers error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load transfers",
      error: error.message,
    });
  }
}

// ======================================================
// CASH MANAGER - PENDING TRANSFERS
// ======================================================

async function pendingTransfers(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const transactions =
      await CashTransaction.find({
        to: getUserId(req),
        type:
          "TEAM_LEADER_TO_CASH_MANAGER",
        status: "SUBMITTED",
      })
        .populate(
          "from",
          "name email phone role"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "Pending transfers error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load pending transfers",
      error: error.message,
    });
  }
}

// ======================================================
// CASH MANAGER - APPROVE TL TRANSFER
// ======================================================

async function approveTransfer(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message:
          "Only Cash Manager can approve transfer",
      });
    }

    const transaction =
      await CashTransaction.findOne({
        _id: req.params.id,
        to: getUserId(req),
        type:
          "TEAM_LEADER_TO_CASH_MANAGER",
        status: "SUBMITTED",
      });

    if (!transaction) {
      return res.status(404).json({
        message:
          "Pending transfer not found",
      });
    }

    const amount =
      Number(transaction.amount || 0);

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message: "Invalid transfer amount",
      });
    }

    const teamLeaderWallet =
      await getOrCreateCashWallet(
        transaction.from
      );

    if (
      Number(
        teamLeaderWallet.pendingBalance || 0
      ) < amount
    ) {
      return res.status(400).json({
        message:
          "Team Leader pending balance is insufficient",
      });
    }

    const cashManagerWallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    teamLeaderWallet.pendingBalance -=
      amount;

    teamLeaderWallet.totalTransferred =
      Number(
        teamLeaderWallet.totalTransferred || 0
      ) + amount;

    cashManagerWallet.availableBalance =
      Number(
        cashManagerWallet.availableBalance || 0
      ) + amount;

    cashManagerWallet.totalReceived =
      Number(
        cashManagerWallet.totalReceived || 0
      ) + amount;

    await teamLeaderWallet.save();
    await cashManagerWallet.save();

    transaction.status = "APPROVED";
    transaction.processedBy = getUserId(req);
    transaction.processedAt = new Date();

    await transaction.save();

    return res.json({
      message:
        "Cash transfer approved successfully",
      transaction,
      cashManagerWallet,
    });
  } catch (error) {
    console.error(
      "Approve transfer error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to approve transfer",
      error: error.message,
    });
  }
}

// ======================================================
// CASH MANAGER - REJECT TL TRANSFER
// ======================================================

async function rejectTransfer(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message:
          "Only Cash Manager can reject transfer",
      });
    }

    const transaction =
      await CashTransaction.findOne({
        _id: req.params.id,
        to: getUserId(req),
        type:
          "TEAM_LEADER_TO_CASH_MANAGER",
        status: "SUBMITTED",
      });

    if (!transaction) {
      return res.status(404).json({
        message:
          "Pending transfer not found",
      });
    }

    const amount =
      Number(transaction.amount || 0);

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message: "Invalid transfer amount",
      });
    }

    const teamLeaderWallet =
      await getOrCreateCashWallet(
        transaction.from
      );

    if (
      Number(
        teamLeaderWallet.pendingBalance || 0
      ) < amount
    ) {
      return res.status(400).json({
        message:
          "Team Leader pending balance is insufficient",
      });
    }

    teamLeaderWallet.pendingBalance -=
      amount;

    teamLeaderWallet.availableBalance =
      Number(
        teamLeaderWallet.availableBalance || 0
      ) + amount;

    await teamLeaderWallet.save();

    transaction.status = "REJECTED";
    transaction.processedBy = getUserId(req);
    transaction.processedAt = new Date();

    await transaction.save();

    return res.json({
      message: "Cash transfer rejected",
      transaction,
      cashWallet: teamLeaderWallet,
    });
  } catch (error) {
    console.error(
      "Reject transfer error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to reject transfer",
      error: error.message,
    });
  }
}

// ======================================================
// CASH MANAGER - MY WALLET
// ======================================================

async function getCashManagerWallet(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const wallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    return res.json({
      cashWallet: wallet,
      wallet,
    });
  } catch (error) {
    console.error(
      "Get CM wallet error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load Cash Manager wallet",
      error: error.message,
    });
  }
}

// ======================================================
// CASH MANAGER - TRANSFER TO ADMIN
// ======================================================

async function transferToAdmin(req, res) {
  try {
    if (req.user.role !== "CASH_MANAGER") {
      return res.status(403).json({
        message:
          "Only Cash Manager can transfer to Admin",
      });
    }

    const {
      adminId,
      amount,
      note,
    } = req.body;

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message:
          "Invalid transfer amount",
      });
    }

    let admin;

    if (adminId) {
      admin = await User.findOne({
        _id: adminId,
        role: {
          $in: [
            "ADMIN",
            "SUPER_ADMIN",
          ],
        },
        status: "ACTIVE",
      });
    } else {
      admin = await User.findOne({
        role: {
          $in: [
            "ADMIN",
            "SUPER_ADMIN",
          ],
        },
        status: "ACTIVE",
      }).sort({
        role: 1,
      });
    }

    if (!admin) {
      return res.status(400).json({
        message:
          "Active Admin not found",
      });
    }

    const transferAmount =
      Number(amount);

    const cashManagerWallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    if (
      Number(
        cashManagerWallet.availableBalance || 0
      ) < transferAmount
    ) {
      return res.status(400).json({
        message:
          "Insufficient available cash balance",
      });
    }

    cashManagerWallet.availableBalance -=
      transferAmount;

    cashManagerWallet.pendingBalance =
      Number(
        cashManagerWallet.pendingBalance || 0
      ) + transferAmount;

    await cashManagerWallet.save();

    const transaction =
      await CashTransaction.create({
        from: getUserId(req),
        to: admin._id,
        amount: transferAmount,
        type:
          "CASH_MANAGER_TO_ADMIN",
        status: "SUBMITTED",
        note:
          note ||
          "Cash transfer submitted to Admin",
      });

    return res.status(201).json({
      message:
        "Cash transfer to Admin submitted successfully",
      transaction,
      cashManagerWallet,
    });
  } catch (error) {
    console.error(
      "Transfer to Admin error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to transfer cash to Admin",
      error: error.message,
    });
  }
}

// ======================================================
// ADMIN - PENDING TRANSFERS
// ======================================================

async function pendingAdminTransfers(req, res) {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const transactions =
      await CashTransaction.find({
        to: getUserId(req),
        type:
          "CASH_MANAGER_TO_ADMIN",
        status: "SUBMITTED",
      })
        .populate(
          "from",
          "name email phone role"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      transactions,
    });
  } catch (error) {
    console.error(
      "Pending admin transfers error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load pending Admin transfers",
      error: error.message,
    });
  }
}

// ======================================================
// ADMIN - APPROVE CM TRANSFER
// ======================================================

async function approveAdminTransfer(req, res) {
  try {
    // --------------------------------------------------
    // ADMIN ROLE
    // --------------------------------------------------

    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message:
          "Only Admin can approve transfer",
      });
    }

    const adminId = getUserId(req);
    const transactionId = req.params.id;

    if (!transactionId) {
      return res.status(400).json({
        message:
          "Transfer ID is required",
      });
    }

    // --------------------------------------------------
    // FIND EXACT PENDING TRANSFER
    // --------------------------------------------------

    const transaction =
      await CashTransaction.findOne({
        _id: transactionId,
        to: adminId,
        type:
          "CASH_MANAGER_TO_ADMIN",
        status: "SUBMITTED",
      });

    if (!transaction) {
      return res.status(404).json({
        message:
          "Pending Admin transfer not found",
      });
    }

    // --------------------------------------------------
    // VALIDATE AMOUNT
    // --------------------------------------------------

    const amount =
      Number(transaction.amount || 0);

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message:
          "Invalid transfer amount",
      });
    }

    // --------------------------------------------------
    // CASH MANAGER WALLET
    // --------------------------------------------------

    const cashManagerWallet =
      await getOrCreateCashWallet(
        transaction.from
      );

    const cmPending =
      Number(
        cashManagerWallet.pendingBalance || 0
      );

    // --------------------------------------------------
    // ADMIN WALLET
    // --------------------------------------------------

    const adminWallet =
      await getOrCreateCashWallet(
        adminId
      );

    // --------------------------------------------------
    // IMPORTANT:
    //
    // If pending balance is available:
    // pending -> Admin
    //
    // If old/inconsistent data has no pending amount,
    // check whether transaction amount is still reflected
    // in Cash Manager available balance.
    // --------------------------------------------------

    if (cmPending >= amount) {
      // Normal flow
      cashManagerWallet.pendingBalance =
        cmPending - amount;

      cashManagerWallet.totalTransferred =
        Number(
          cashManagerWallet.totalTransferred || 0
        ) + amount;
    } else {
      // ------------------------------------------------
      // DATA RECOVERY CASE
      //
      // This handles old transactions where the transfer
      // exists as SUBMITTED but pendingBalance was not
      // correctly maintained.
      // ------------------------------------------------

      const cmAvailable =
        Number(
          cashManagerWallet.availableBalance || 0
        );

      if (cmAvailable >= amount) {
        cashManagerWallet.availableBalance =
          cmAvailable - amount;

        cashManagerWallet.totalTransferred =
          Number(
            cashManagerWallet.totalTransferred || 0
          ) + amount;
      } else {
        return res.status(400).json({
          message:
            `Cash Manager balance is insufficient. Pending: ₹${cmPending}, Available: ₹${cmAvailable}, Required: ₹${amount}`,
        });
      }
    }

    // --------------------------------------------------
    // ADMIN RECEIVES CASH
    // --------------------------------------------------

    adminWallet.availableBalance =
      Number(
        adminWallet.availableBalance || 0
      ) + amount;

    adminWallet.totalReceived =
      Number(
        adminWallet.totalReceived || 0
      ) + amount;

    // --------------------------------------------------
    // SAVE WALLETS
    // --------------------------------------------------

    await cashManagerWallet.save();
    await adminWallet.save();

    // --------------------------------------------------
    // MARK TRANSACTION APPROVED
    // --------------------------------------------------

    transaction.status = "APPROVED";

    transaction.processedBy = adminId;

    transaction.processedAt = new Date();

    await transaction.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.json({
      success: true,
      message:
        "Admin transfer approved successfully",
      transaction,
      adminWallet,
      cashManagerWallet,
    });
  } catch (error) {
    console.error(
      "Approve Admin transfer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to approve Admin transfer",
      error: error.message,
    });
  }
}

// ======================================================
// ADMIN - REJECT CM TRANSFER
// ======================================================

async function rejectAdminTransfer(req, res) {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message:
          "Only Admin can reject transfer",
      });
    }

    const adminId = getUserId(req);

    const transaction =
      await CashTransaction.findOne({
        _id: req.params.id,
        to: adminId,
        type:
          "CASH_MANAGER_TO_ADMIN",
        status: "SUBMITTED",
      });

    if (!transaction) {
      return res.status(404).json({
        message:
          "Pending Admin transfer not found",
      });
    }

    const amount =
      Number(transaction.amount || 0);

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message:
          "Invalid transfer amount",
      });
    }

    const cashManagerWallet =
      await getOrCreateCashWallet(
        transaction.from
      );

    const pendingBalance =
      Number(
        cashManagerWallet.pendingBalance || 0
      );

    // --------------------------------------------------
    // NORMAL CASE
    // --------------------------------------------------

    if (pendingBalance >= amount) {
      cashManagerWallet.pendingBalance =
        pendingBalance - amount;

      cashManagerWallet.availableBalance =
        Number(
          cashManagerWallet.availableBalance || 0
        ) + amount;
    } else {
      // ------------------------------------------------
      // OLD DATA RECOVERY
      //
      // If amount is already available, nothing needs
      // to be added again. We simply keep the balance.
      // ------------------------------------------------

      const availableBalance =
        Number(
          cashManagerWallet.availableBalance || 0
        );

      if (availableBalance < amount) {
        return res.status(400).json({
          message:
            `Cash Manager balance is insufficient. Pending: ₹${pendingBalance}, Available: ₹${availableBalance}, Required: ₹${amount}`,
        });
      }
    }

    await cashManagerWallet.save();

    transaction.status = "REJECTED";

    transaction.processedBy = adminId;

    transaction.processedAt = new Date();

    await transaction.save();

    return res.json({
      success: true,
      message:
        "Admin transfer rejected",
      transaction,
      cashManagerWallet,
    });
  } catch (error) {
    console.error(
      "Reject Admin transfer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reject Admin transfer",
      error: error.message,
    });
  }
}


// ======================================================
// ADMIN - CASH MANAGER BALANCES
// ======================================================

async function listCashManagerBalances(req, res) {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const cashManagers = await User.find({
      role: "CASH_MANAGER",
    })
      .select(
        "_id name email phone mobile role status"
      )
      .sort({
        name: 1,
      })
      .lean();

    const managerIds = cashManagers.map(
      (manager) => manager._id
    );

    const wallets = await CashWallet.find({
      user: {
        $in: managerIds,
      },
    })
      .select(
        "user availableBalance pendingBalance totalCollected totalReceived totalTransferred"
      )
      .lean();

    const walletMap = new Map();

    wallets.forEach((wallet) => {
      walletMap.set(
        String(wallet.user),
        wallet
      );
    });

    const result = cashManagers.map(
      (manager) => {
        const wallet =
          walletMap.get(
            String(manager._id)
          ) || {
            user: manager._id,
            availableBalance: 0,
            pendingBalance: 0,
            totalCollected: 0,
            totalReceived: 0,
            totalTransferred: 0,
          };

        return {
          _id: manager._id,

          name: manager.name || "Cash Manager",

          email: manager.email || "",

          phone:
            manager.phone ||
            manager.mobile ||
            "",

          role: manager.role,

          status: manager.status,

          availableBalance:
            Number(
              wallet.availableBalance || 0
            ),

          pendingBalance:
            Number(
              wallet.pendingBalance || 0
            ),

          totalCollected:
            Number(
              wallet.totalCollected || 0
            ),

          totalReceived:
            Number(
              wallet.totalReceived || 0
            ),

          totalTransferred:
            Number(
              wallet.totalTransferred || 0
            ),

          cashWallet: wallet,
        };
      }
    );

    return res.json({
      success: true,
      cashManagers: result,
      managers: result,
      data: result,
    });
  } catch (error) {
    console.error(
      "List Cash Manager balances error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load Cash Manager balances",
      error: error.message,
    });
  }
}

// ======================================================
// ADMIN - MY WALLET
// ======================================================

async function getAdminCashWallet(req, res) {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const wallet =
      await getOrCreateCashWallet(
        getUserId(req)
      );

    return res.json({
      cashWallet: wallet,
      wallet,
    });
  } catch (error) {
    console.error(
      "Get Admin wallet error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load Admin wallet",
      error: error.message,
    });
  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  collectCash,
  myCollections,
  getMyCashWallet,
  listCashManagers,
  transferCash,
  myTransfers,

  pendingTransfers,
  approveTransfer,
  rejectTransfer,
  getCashManagerWallet,

  transferToAdmin,
  pendingAdminTransfers,
  approveAdminTransfer,
  rejectAdminTransfer,
  getAdminCashWallet,
  listCashManagerBalances,

  getOrCreateCashWallet,
};