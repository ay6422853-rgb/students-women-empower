
const mongoose = require("mongoose");


// ======================================================
// PRODUCT SCHEMA
// ======================================================
//
// Product ke andar sirf PRODUCT ki information aur
// COMPANY ka stock maintain hoga.
//
// User level stock:
//
// COMPANY
//    ↓
// DISTRIBUTION_MANAGER
//    ↓
// SUPER_TEAM_LEADER
//    ↓
// TEAM_LEADER
//
// In teenon ka stock Stock.js me maintain hoga.
//
// Isse same stock ko do jagah maintain karne ki
// problem nahi hogi.
// ======================================================


const productSchema =
  new mongoose.Schema(
    {

      // ==================================================
      // BASIC PRODUCT INFORMATION
      // ==================================================

      name: {
        type:
          String,

        required:
          true,

        trim:
          true
      },


      // ==================================================
      // DESCRIPTION
      // ==================================================

      description: {
        type:
          String,

        default:
          "",

        trim:
          true
      },


      // ==================================================
      // CATEGORY
      // ==================================================

      category: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Category",

        default:
          null
      },


      // ==================================================
      // PRICE
      // ==================================================

      price: {
        type:
          Number,

        required:
          true,

        min:
          0
      },


      // ==================================================
      // SKU
      // ==================================================

      sku: {
        type:
          String,

        unique:
          true,

        sparse:
          true,

        trim:
          true
      },


      // ==================================================
      // PRODUCT IMAGES
      // ==================================================

      images: {
        type:
          [String],

        default:
          []
      },


      // ==================================================
      // COMPANY STOCK
      // ==================================================
      //
      // Ye sirf COMPANY ka available stock hai.
      //
      // Example:
      //
      // Company Stock = 100
      //
      // Company → Distributor = 30
      //
      // Company Stock = 70
      //
      // Distributor ka 30 Stock.js me hoga.
      // ==================================================

      stock: {
        type:
          Number,

        default:
          0,

        min:
          0
      },


      // ==================================================
      // COMPANY LOW STOCK THRESHOLD
      // ==================================================
      //
      // Ye COMPANY stock ki low-stock limit hai.
      //
      // Example:
      //
      // Company Stock = 8
      // Company Low Limit = 10
      //
      // Result:
      // LOW STOCK
      //
      // Ye Distribution Manager / STL / TL ki
      // personal low-stock limit nahi hai.
      //
      // Unki limit Stock model me alag hogi.
      // ==================================================

      lowStockThreshold: {
        type:
          Number,

        default:
          0,

        min:
          0
      },


      // ==================================================
      // STATUS
      // ==================================================

      status: {
        type:
          String,

        enum: [
          "ACTIVE",
          "INACTIVE"
        ],

        default:
          "ACTIVE"
      },


      // ==================================================
      // CREATED BY
      // ==================================================

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        default:
          null
      }

    },

    {
      timestamps:
        true
    }
  );


// ======================================================
// INDEXES
// ======================================================

productSchema.index({
  status: 1
});

productSchema.index({
  category: 1
});

productSchema.index({
  createdAt: -1
});


// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );
