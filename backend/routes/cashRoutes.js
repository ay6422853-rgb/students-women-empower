const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const c = require("../controllers/cashController");

router.use(auth);

// ======================================================
// TEAM LEADER
// ======================================================

// Direct cash collection
router.post(
  "/collect",
  allowRoles("TEAM_LEADER"),
  c.collectCash
);

// Collection history
router.get(
  "/my-collections",
  allowRoles("TEAM_LEADER"),
  c.myCollections
);

// Team Leader cash wallet
router.get(
  "/my-wallet",
  allowRoles("TEAM_LEADER"),
  c.getMyCashWallet
);

// Cash Managers
router.get(
  "/cash-managers",
  allowRoles("TEAM_LEADER"),
  c.listCashManagers
);

// Transfer Team Leader → Cash Manager
router.post(
  "/transfer",
  allowRoles("TEAM_LEADER"),
  c.transferCash
);

// Transfer history
router.get(
  "/my-transfers",
  allowRoles("TEAM_LEADER"),
  c.myTransfers
);

// ======================================================
// CASH MANAGER
// ======================================================

// Pending Team Leader transfers
router.get(
  "/cash-manager/pending",
  allowRoles("CASH_MANAGER"),
  c.pendingTransfers
);

// Approve TL → Cash Manager
router.patch(
  "/cash-manager/:id/approve",
  allowRoles("CASH_MANAGER"),
  c.approveTransfer
);

// Reject TL → Cash Manager
router.patch(
  "/cash-manager/:id/reject",
  allowRoles("CASH_MANAGER"),
  c.rejectTransfer
);

// Cash Manager wallet
router.get(
  "/cash-manager/wallet",
  allowRoles("CASH_MANAGER"),
  c.getCashManagerWallet
);

// Cash Manager → Admin
router.post(
  "/cash-manager/admin-transfer",
  allowRoles("CASH_MANAGER"),
  c.transferToAdmin
);

// ======================================================
// ADMIN
// ======================================================

// Pending Cash Manager → Admin transfers
router.get(
  "/admin/pending",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.pendingAdminTransfers
);

// Approve Cash Manager → Admin
router.patch(
  "/admin/:id/approve",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.approveAdminTransfer
);

// Reject Cash Manager → Admin
router.patch(
  "/admin/:id/reject",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.rejectAdminTransfer
);

// ======================================================
// ADMIN - CASH MANAGER BALANCES
// ======================================================

router.get(
  "/admin/cash-managers",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.listCashManagerBalances
);

// Admin wallet
router.get(
  "/admin/wallet",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.getAdminCashWallet
);

module.exports = router;