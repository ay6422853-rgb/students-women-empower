const mongoose = require("mongoose");
module.exports = mongoose.model("WalletTransaction", new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["COMMISSION", "WITHDRAWAL", "ADJUSTMENT"], required: true },
  amount: { type: Number, required: true },
  referenceId: String,
  note: String
}, { timestamps: true }));
