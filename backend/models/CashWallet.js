const mongoose = require("mongoose");

const cashWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Current cash available with the user
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Cash transfer submitted but not yet approved
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total cash collected from members/orders
    totalCollected: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total cash received from another level
    totalReceived: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total cash successfully transferred out
    totalTransferred: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CashWallet", cashWalletSchema);