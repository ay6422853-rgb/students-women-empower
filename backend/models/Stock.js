const mongoose = require("mongoose");


// ======================================================
// STOCK ITEM
// ======================================================
// Har owner ke har product ka:
// 1. Current quantity
// 2. Apni low-stock limit
//
// Ye same model use hoga:
// - DISTRIBUTION_MANAGER
// - SUPER_TEAM_LEADER
// - TEAM_LEADER
//
// Example:
//
// Product: Shampoo
// Quantity: 8
// Low Stock Limit: 10
//
// 8 <= 10
// => LOW STOCK
// ======================================================

const stockItemSchema = new mongoose.Schema(
  {

    // ==================================================
    // PRODUCT
    // ==================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },


    // ==================================================
    // CURRENT QUANTITY
    // ==================================================

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },


    // ==================================================
    // LOW STOCK THRESHOLD
    // ==================================================
    // Owner khud set karega.
    //
    // Example:
    //
    // Distribution Manager:
    // Shampoo = 10
    //
    // Super Team Leader:
    // Shampoo = 20
    //
    // Team Leader:
    // Shampoo = 5
    //
    // Teeno ki limit alag ho sakti hai.
    // ==================================================

    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }

  },
  {
    _id: false
  }
);


// ======================================================
// STOCK
// ======================================================

const stockSchema = new mongoose.Schema(
  {

    // ==================================================
    // STOCK OWNER
    // ==================================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },


    // ==================================================
    // STOCK ITEMS
    // ==================================================

    items: {
      type: [stockItemSchema],
      default: []
    }

  },
  {
    timestamps: true
  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "Stock",
  stockSchema
);