const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/Withdrawal");

async function wallet(req, res) {
  const data = await Wallet.findOne({ user: req.user.id });
  res.json({ wallet: data || { user: req.user.id, availableBalance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0 } });
}

async function withdraw(req, res) {
  const { amount, bankDetails } = req.body;
  const wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet || amount <= 0 || wallet.availableBalance < amount) {
    return res.status(400).json({ message: "Insufficient available balance" });
  }
  if (!bankDetails?.accountNumber || !bankDetails?.ifsc) {
    return res.status(400).json({ message: "Bank details are required for withdrawal" });
  }

  const withdrawal = await Withdrawal.create({ user: req.user.id, amount, bankDetails });
  wallet.availableBalance -= Number(amount);
  await wallet.save();
  res.status(201).json({ message: "Withdrawal request submitted", withdrawal });
}

async function listWithdrawals(req, res) {
  const filter = req.user.role === "ADMIN" || req.user.role === "CASH_MANAGER" ? {} : { user: req.user.id };
  res.json({ withdrawals: await Withdrawal.find(filter).populate("user processedBy").sort({ createdAt: -1 }) });
}

async function processWithdrawal(req, res) {
  const { status, transactionId } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

  withdrawal.status = status;
  withdrawal.transactionId = transactionId;
  withdrawal.processedBy = req.user.id;
  await withdrawal.save();

  if (status === "PAID") {
    await Wallet.findOneAndUpdate({ user: withdrawal.user }, { $inc: { totalWithdrawn: withdrawal.amount } });
  }
  if (status === "REJECTED") {
    await Wallet.findOneAndUpdate({ user: withdrawal.user }, { $inc: { availableBalance: withdrawal.amount } });
  }

  res.json({ message: "Withdrawal processed", withdrawal });
}

module.exports = { wallet, withdraw, listWithdrawals, processWithdrawal };
