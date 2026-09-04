const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const c = require("../controllers/walletController");

router.use(auth);
router.get("/", c.wallet);
router.post("/withdraw", c.withdraw);
router.get("/withdrawals", c.listWithdrawals);
router.patch("/withdrawals/:id", allowRoles("CASH_MANAGER", "ADMIN"), c.processWithdrawal);

module.exports = router;
