const mongoose = require("mongoose");
module.exports = mongoose.model("Withdrawal", new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 },
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  status: { type: String, enum: ["PENDING", "PAID", "REJECTED"], default: "PENDING" },
  transactionId: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true }));
