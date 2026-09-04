const router = require("express").Router();

const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const c = require("../controllers/userController");


// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
  "/me",
  auth,
  c.me
);


// ==========================================
// CURRENT USER - MY REFERRALS
// ==========================================

router.get(
  "/my-referrals",
  auth,
  c.myReferrals
);


// ==========================================
// TEAM LEADER - MY NETWORK
// ==========================================

router.get(
  "/my-network",
  auth,
  allowRoles("TEAM_LEADER"),
  c.myNetwork
);


// ==========================================
// DISTRIBUTION MANAGER - SUPER TEAM LEADERS
// ==========================================

router.get(
  "/super-team-leaders",
  auth,
  allowRoles("DISTRIBUTION_MANAGER"),
  c.distributionManagerSuperTeamLeaders
);

// ==========================================
// GET ACTIVE TEAM LEADERS
// ==========================================

router.get(
  "/team-leaders",
  auth,
  c.listTeamLeaders
);


// ==========================================
// CTO - TEAM MEMBERS
// ==========================================

router.get(
  "/cto/members",
  auth,
  allowRoles("CHIEF_TEAM_OFFICER", "ADMIN"),
  c.ctoMembers
);


// ==========================================
// CTO - TEAM LEADERS
// ==========================================

router.get(
  "/cto/team-leaders",
  auth,
  allowRoles("CHIEF_TEAM_OFFICER", "ADMIN"),
  c.ctoTeamLeaders
);


// ==========================================
// CTO - SUPER TEAM LEADERS
// ==========================================

router.get(
  "/cto/super-team-leaders",
  auth,
  allowRoles("CHIEF_TEAM_OFFICER", "ADMIN"),
  c.ctoSuperTeamLeaders
);


// ==========================================
// CTO - ASSIGN TEAM
// ==========================================

router.patch(
  "/cto/:id/assign-team",
  auth,
  allowRoles("CHIEF_TEAM_OFFICER", "ADMIN"),
  c.assignTeam
);


// ==========================================
// CTO - CHANGE ROLE
// ==========================================

router.patch(
  "/cto/:id/role",
  auth,
  allowRoles("CHIEF_TEAM_OFFICER", "ADMIN"),
  c.ctoChangeRole
);


// ==========================================
// ADMIN - LIST USERS
// ==========================================

router.get(
  "/",
  auth,
  allowRoles("ADMIN"),
  c.listUsers
);


// ==========================================
// ADMIN - USER REFERRALS
// ==========================================

router.get(
  "/:id/referrals",
  auth,
  allowRoles("ADMIN"),
  c.referrals
);


// ==========================================
// ADMIN - CHANGE USER ROLE
// ==========================================

router.patch(
  "/:id/role",
  auth,
  allowRoles("ADMIN"),
  c.changeRole
);


module.exports = router;