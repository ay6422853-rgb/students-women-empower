const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const c = require("../controllers/commissionController");


// ======================================================
// AUTHENTICATION
// ======================================================

router.use(auth);


// ======================================================
// ALL COMMISSIONS
// ======================================================
// MEMBER / TEAM LEADER:
//     apni commissions
//
// CASH MANAGER:
//     payable commissions
//
// ADMIN / SUPER ADMIN:
//     all commissions
// ======================================================

router.get(
  "/",
  c.listCommissions
);


// ======================================================
// ORDER COMMISSION SUMMARY
// ======================================================
// CASH MANAGER / ADMIN:
// kisi particular order ki commission summary
// ======================================================

router.get(
  "/order/:orderId/summary",
  allowRoles(
    "CASH_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.orderCommissionSummary
);


// ======================================================
// CASH MANAGER → PAY COMMISSION
// ======================================================
// Cash Manager ke CashWallet se actual cash deduct hoga.
//
// Admin / Super Admin ko bhi administrative control
// ke liye permission rakhi gayi hai.
// ======================================================

router.patch(
  "/:id/pay",
  allowRoles(
    "CASH_MANAGER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.payCommissionController
);


module.exports = router;