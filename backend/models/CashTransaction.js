const mongoose = require("mongoose");

const cashTransactionSchema = new mongoose.Schema(
  {
    // ========================================
    // ORDER
    // ========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },

    // ========================================
    // FROM USER
    // ========================================

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ========================================
    // TO USER
    // ========================================

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // ========================================
    // AMOUNT
    // ========================================

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    // ========================================
    // TRANSACTION TYPE
    // ========================================

    type: {
      type: String,
      enum: [
        "MEMBER_TO_TEAM_LEADER",
        "TEAM_LEADER_TO_CASH_MANAGER",
        "CASH_MANAGER_TO_ADMIN"
      ],
      required: true
    },

    // ========================================
    // STATUS
    // ========================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "SUBMITTED",
        "APPROVED",
        "REJECTED"
      ],
      default: "PENDING"
    },

    // ========================================
    // TRANSACTION ID
    // ========================================

    transactionId: {
      type: String,
      trim: true,
      default: null
    },

    // ========================================
    // NOTE
    // ========================================

    note: {
      type: String,
      trim: true,
      default: ""
    },

    // ========================================
    // PROCESSED BY
    // ========================================

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // ========================================
    // PROCESSED AT
    // ========================================

    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "CashTransaction",
  cashTransactionSchema
);