const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const c = require("../controllers/ctoController");

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(auth);

// ======================================================
// CTO DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.dashboard
);

// ======================================================
// MEMBERS
// ======================================================

router.get(
  "/members",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.members
);

// ======================================================
// TEAM LEADERS
// ======================================================

router.get(
  "/team-leaders",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.teamLeaders
);

// ======================================================
// SUPER TEAM LEADERS
// ======================================================

router.get(
  "/super-team-leaders",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.superTeamLeaders
);

// ======================================================
// NETWORK
// ======================================================

router.get(
  "/network",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.network
);

// ======================================================
// TEAM BUILDING
// ======================================================

router.get(
  "/team-building",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.teamBuilding
);

// ======================================================
// PERFORMANCE
// ======================================================

router.get(
  "/performance",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.performance
);

// ======================================================
// SALES
// Weekly + Monthly Sales
// ======================================================

router.get(
  "/sales",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.sales
);

// ======================================================
// CHANGE ROLE
// ======================================================

router.patch(
  "/users/:id/role",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.changeRole
);

// ======================================================
// SINGLE MEMBER → TEAM LEADER
// ======================================================

router.patch(
  "/members/:id/team-leader",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.assignMember
);

// ======================================================
// BULK MEMBERS → TEAM LEADER
// ======================================================

router.patch(
  "/members/bulk-team-leader",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.bulkAssignMembers
);

// ======================================================
// SINGLE TEAM LEADER → SUPER TEAM LEADER
// ======================================================

router.patch(
  "/team-leaders/:id/super-team-leader",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.assignTeamLeader
);

// ======================================================
// BULK TEAM LEADERS → SUPER TEAM LEADER
// ======================================================

router.patch(
  "/team-leaders/bulk-super-team-leader",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.bulkAssignTeamLeaders
);

// ======================================================
// SUPER TEAM LEADER → SELLING TEAM LEADER
// ======================================================

router.patch(
  "/super-team-leaders/:id/selling-team-leader",
  allowRoles("CHIEF_TEAM_OFFICER"),
  c.assignSellingTeamLeader
);

module.exports = router;