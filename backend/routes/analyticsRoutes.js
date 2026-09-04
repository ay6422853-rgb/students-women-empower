const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { dashboard } = require("../controllers/analyticsController");

router.get("/dashboard", auth, allowRoles("ADMIN"), dashboard);
module.exports = router;
