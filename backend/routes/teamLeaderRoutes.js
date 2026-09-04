const router = require("express").Router();

const auth =
  require("../middleware/authMiddleware");

const allowRoles =
  require("../middleware/roleMiddleware");

const c =
  require("../controllers/teamLeaderController");


// ========================================
// AUTH
// ========================================

router.use(auth);


// ========================================
// TEAM LEADER DASHBOARD
// ========================================

router.get(
  "/dashboard",
  allowRoles("TEAM_LEADER"),
  c.dashboard
);


module.exports = router;