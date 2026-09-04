const mongoose = require("mongoose");
module.exports = mongoose.model("Commission", new mongoose.Schema({
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sourceUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  level: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "AVAILABLE", "PAID"], default: "PENDING" }
}, { timestamps: true }));
