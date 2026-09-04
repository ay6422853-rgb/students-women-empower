
const mongoose = require("mongoose");


// ======================================================
// STOCK TRANSACTION
// ======================================================
//
// Stock Flow:
//
// COMPANY
//    ↓
// DISTRIBUTION_MANAGER
//    ↓
// SUPER_TEAM_LEADER
//    ↓
// TEAM_LEADER
//
// Har stock movement ka complete record:
//
// - Product
// - From
// - To
// - Quantity
// - Transaction Type
// - Note
// - Transaction Date / Time
//
// Ye model Calendar / Date Wise Stock History ke liye
// use hoga.
// ======================================================


const stockTransactionSchema =
  new mongoose.Schema(
    {

      // ==================================================
      // PRODUCT
      // ==================================================

      product: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Product",

        required:
          true,

        index:
          true

      },


      // ==================================================
      // FROM USER
      // ==================================================
      //
      // Stock kis user se nikla.
      //
      // Company → Distributor:
      // from = null
      //
      // Distributor → Super Team Leader:
      // from = Distributor
      //
      // Super Team Leader → Team Leader:
      // from = Super Team Leader
      // ==================================================

      from: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        default:
          null,

        index:
          true

      },


      // ==================================================
      // TO USER
      // ==================================================
      //
      // Stock kisko mila.
      //
      // Company → Distributor:
      // to = Distributor
      //
      // Distributor → Super Team Leader:
      // to = Super Team Leader
      //
      // Super Team Leader → Team Leader:
      // to = Team Leader
      // ==================================================

      to: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        default:
          null,

        index:
          true

      },


      // ==================================================
      // QUANTITY
      // ==================================================

      quantity: {

        type:
          Number,

        required:
          true,

        min:
          1

      },


      // ==================================================
      // TRANSACTION TYPE
      // ==================================================

      type: {

        type:
          String,

        enum: [

          // ----------------------------------------------
          // COMPANY STOCK RECEIVED / STOCK IN
          // ----------------------------------------------

          "STOCK_IN",


          // ----------------------------------------------
          // COMPANY
          // →
          // DISTRIBUTION MANAGER
          // ----------------------------------------------

          "COMPANY_TO_DISTRIBUTOR",


          // ----------------------------------------------
          // DISTRIBUTION MANAGER
          // →
          // SUPER TEAM LEADER
          // ----------------------------------------------

          "DISTRIBUTOR_TO_SUPER_TEAM_LEADER",


          // ----------------------------------------------
          // SUPER TEAM LEADER
          // →
          // TEAM LEADER
          // ----------------------------------------------

          "SUPER_TEAM_LEADER_TO_TEAM_LEADER"

        ],

        required:
          true,

        index:
          true

      },


      // ==================================================
      // TRANSACTION DATE
      // ==================================================
      //
      // Actual stock movement ki date/time.
      //
      // Agar value frontend se nahi aati,
      // to current date/time automatically set hoga.
      //
      // Calendar isi field ko use kar sakta hai.
      // ==================================================

      transactionDate: {

        type:
          Date,

        default:
          Date.now,

        required:
          true,

        index:
          true

      },


      // ==================================================
      // NOTE
      // ==================================================

      note: {

        type:
          String,

        trim:
          true,

        default:
          ""

      }

    },

    {

      // ==================================================
      // CREATED / UPDATED TIME
      // ==================================================
      //
      // createdAt:
      // Database me record kab create hua.
      //
      // updatedAt:
      // Record kab last update hua.
      //
      // transactionDate:
      // Actual stock movement kab hua.
      // ==================================================

      timestamps:
        true

    }
  );


// ======================================================
// INDEXES
// ======================================================
//
// Calendar/date-wise search fast karne ke liye.
//
// Example:
//
// 28 August ke transactions
// → transactionDate
//
// Kisi user ke transactions
// → from + transactionDate
// → to + transactionDate
//
// Kisi product ka history
// → product + transactionDate
//
// Transaction type ka history
// → type + transactionDate
// ======================================================


stockTransactionSchema.index({

  from:
    1,

  transactionDate:
    -1

});


stockTransactionSchema.index({

  to:
    1,

  transactionDate:
    -1

});


stockTransactionSchema.index({

  type:
    1,

  transactionDate:
    -1

});


stockTransactionSchema.index({

  product:
    1,

  transactionDate:
    -1

});


// ======================================================
// COMBINED USER + DATE INDEX
// ======================================================
//
// Current user ke Received / Transfer records
// date-wise jaldi milenge.
// ======================================================

stockTransactionSchema.index({

  from:
    1,

  to:
    1,

  transactionDate:
    -1

});


// ======================================================
// EXPORT
// ======================================================

module.exports =
  mongoose.model(
    "StockTransaction",
    stockTransactionSchema
  );
