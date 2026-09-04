const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const adminController = require("../controllers/adminController");
const cashController = require("../controllers/cashController");

// ======================================================
// ADMIN AUTH
// ======================================================

router.use(auth);

router.use(
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  )
);

// ======================================================
// DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  adminController.dashboard
);

// ======================================================
// USERS
// ======================================================

router.get(
  "/users",
  adminController.listUsers
);

router.get(
  "/users/:id/portfolio",
  adminController.userPortfolio
);

router.patch(
  "/users/:id",
  adminController.updateUser
);

router.patch(
  "/users/:id/status",
  adminController.changeUserStatus
);

router.patch(
  "/users/:id/role",
  adminController.changeUserRole
);

// ======================================================
// SHORTLIST
// ======================================================

router.post(
  "/users/:id/shortlist",
  adminController.shortlistUser
);

router.get(
  "/shortlisted-users",
  adminController.shortlistedUsers
);

// ======================================================
// ORDERS / SALES
// ======================================================

router.get(
  "/orders",
  adminController.listOrders
);

// ======================================================
// COMMISSIONS
// ======================================================

router.get(
  "/commissions",
  adminController.listCommissions
);

// ======================================================
// WITHDRAWALS
// ======================================================

router.get(
  "/withdrawals",
  adminController.listWithdrawals
);

// ======================================================
// CASH TRANSACTIONS
// ======================================================

router.get(
  "/cash-transactions",
  adminController.listCashTransactions
);

// ======================================================
// CASH MANAGER → ADMIN
// ======================================================

// Pending Cash Manager → Admin transfers
router.get(
  "/cash/admin-transfers",
  cashController.pendingAdminTransfers
);

// Approve Cash Manager → Admin transfer
router.patch(
  "/cash/admin-transfers/:id/approve",
  cashController.approveAdminTransfer
);

// Reject Cash Manager → Admin transfer
router.patch(
  "/cash/admin-transfers/:id/reject",
  cashController.rejectAdminTransfer
);

// ======================================================
// ADMIN CASH WALLET
// ======================================================

// Admin's CashWallet
router.get(
  "/cash/wallet",
  cashController.getAdminCashWallet
);

// ======================================================
// STOCK
// ======================================================

router.get(
  "/stock",
  adminController.stockOverview
);

router.get(
  "/stock/transactions",
  adminController.listStockTransactions
);

// ======================================================
// PRODUCTS
// ======================================================

router.get(
  "/products",
  adminController.listProducts
);

router.get(
  "/categories",
  adminController.listCategories
);

// ======================================================
// NETWORK
// ======================================================

router.get(
  "/network",
  adminController.networkOverview
);

// ======================================================
// ROLE SUMMARY
// ======================================================

router.get(
  "/role-summary",
  adminController.roleSummary
);

// ======================================================
// ACTIVITY / AUDIT
// ======================================================

router.get(
  "/activity-logs",
  adminController.activityLogs
);

module.exports = router;