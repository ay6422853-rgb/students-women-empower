
const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const c = require("../controllers/stockController");


// ========================================
// AUTHENTICATION
// ========================================

router.use(auth);


// ========================================
// MY STOCK
// ========================================
//
// GET /api/stock/mine
//
// Distribution Manager
// Super Team Leader
// Team Leader
//
// ========================================

router.get(
  "/mine",
  c.myStock
);


// ==========================================
// TEAM LEADER - MY STOCK
// ==========================================
//
// GET /api/stock/team-leader
//
// Sirf Team Leader apna stock dekh sakta hai.
//
// ==========================================

router.get(
  "/team-leader",
  allowRoles("TEAM_LEADER"),
  c.teamLeaderStock
);


// ==========================================
// MEMBER - VIEW TEAM LEADER STOCK
// ==========================================
//
// GET /api/stock/team-leader/:teamLeaderId
//
// Member kisi ACTIVE Team Leader ka stock
// dekh sakta hai.
//
// Example:
//
// GET /api/stock/team-leader/64xxxxx
//
// ==========================================

router.get(
  "/team-leader/:teamLeaderId",
  allowRoles("MEMBER"),
  c.memberTeamLeaderStock
);


// ========================================
// DISTRIBUTION MANAGER STOCK OVERVIEW
// ========================================
//
// GET /api/stock/distribution-managers
//
// ADMIN
// SUPER_ADMIN
// PRODUCT_MANAGER
//
// ========================================

router.get(
  "/distribution-managers",
  allowRoles(
    "ADMIN",
    "SUPER_ADMIN",
    "PRODUCT_MANAGER"
  ),
  c.distributionManagerStocks
);


// ========================================
// SET LOW STOCK THRESHOLD
// ========================================
//
// PUT /api/stock/low-stock-threshold/:productId
//
// DISTRIBUTION_MANAGER
// SUPER_TEAM_LEADER
// TEAM_LEADER
//
// ========================================

router.put(
  "/low-stock-threshold/:productId",
  allowRoles(
    "DISTRIBUTION_MANAGER",
    "SUPER_TEAM_LEADER",
    "TEAM_LEADER"
  ),
  c.setLowStockThreshold
);


// ========================================
// MY STOCK TRANSACTIONS
// ========================================
//
// GET /api/stock/transactions
//
// Stock users ke transactions.
//
// ========================================

router.get(
  "/transactions",
  c.myTransactions
);


// ========================================
// TRANSFER STOCK
// ========================================
//
// PRODUCT_MANAGER
// DISTRIBUTION_MANAGER
// SUPER_TEAM_LEADER
// ADMIN
// SUPER_ADMIN
//
// ========================================

router.post(
  "/transfer",
  allowRoles(
    "PRODUCT_MANAGER",
    "DISTRIBUTION_MANAGER",
    "SUPER_TEAM_LEADER",
    "ADMIN",
    "SUPER_ADMIN"
  ),
  c.transferStock
);


module.exports = router;