const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const c = require("../controllers/orderController");

router.use(auth);

// ======================================================
// MEMBER - CREATE ORDER
// ======================================================

router.post(
  "/",
  allowRoles("MEMBER"),
  c.createOrder
);

// ======================================================
// MEMBER + TEAM LEADER - LIST ORDERS
// ======================================================

router.get(
  "/",
  allowRoles("MEMBER", "TEAM_LEADER"),
  c.listOrders
);

// ======================================================
// TEAM LEADER - COLLECT CASH
// ======================================================

router.patch(
  "/:id/collect-cash",
  allowRoles("TEAM_LEADER"),
  c.collectCash
);

// ======================================================
// TEAM LEADER - CONFIRM ORDER
// ======================================================

router.patch(
  "/:id/confirm",
  allowRoles("TEAM_LEADER"),
  c.confirmOrder
);

// ======================================================
// ADMIN - UPDATE PAYMENT
// ======================================================

router.patch(
  "/:id/payment",
  allowRoles("ADMIN", "SUPER_ADMIN"),
  c.updatePayment
);

// ======================================================
// GET SINGLE ORDER
// ======================================================

router.get(
  "/:id",
  c.getOrderById
);

module.exports = router;