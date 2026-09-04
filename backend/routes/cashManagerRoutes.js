const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const c = require("../controllers/cashManagerController");

router.use(auth);

// ======================================================
// CASH MANAGER
// ======================================================

// Team Leader → Cash Manager transfers
router.get(
  "/transfers",
  allowRoles("CASH_MANAGER"),
  c.listCashTransfers
);

// Accept / Reject Team Leader transfer
//
// body:
// { "status": "APPROVED" }
//
// OR
//
// { "status": "REJECTED" }
router.patch(
  "/transfers/:id",
  allowRoles("CASH_MANAGER"),
  c.updateCashTransfer
);

// Cash Manager wallet
router.get(
  "/wallet",
  allowRoles("CASH_MANAGER"),
  c.getMyCashWallet
);

module.exports = router;