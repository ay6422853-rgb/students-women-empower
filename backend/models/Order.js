const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ==========================================
    // BUYER
    // ==========================================

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ==========================================
    // SELLER / TEAM LEADER
    // ==========================================

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ==========================================
    // PRODUCTS
    // ==========================================

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    // ==========================================
    // TOTAL
    // ==========================================

    total: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    paymentMethod: {
      type: String,
      enum: ["CASH"],
      default: "CASH"
    },

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    paymentStatus: {
      type: String,

      enum: [
        "PENDING",
        "SUBMITTED",
        "PAID",
        "APPROVED",
        "REJECTED"
      ],

      default: "PENDING"
    },

    // ==========================================
    // TRANSACTION ID
    // CASH PAYMENT ME REQUIRED NAHI
    // ==========================================

    transactionId: {
      type: String,
      default: null
    },

    // ==========================================
    // ORDER STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED"
      ],

      default: "PENDING"
    }

  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);