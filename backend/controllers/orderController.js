const Order = require("../models/Order");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const User = require("../models/User");
const CashWallet = require("../models/CashWallet");
const CashTransaction = require("../models/CashTransaction");

const {
  createCommissionsForOrder,
} = require("../services/commissionService");

// ======================================================
// HELPER: FIND PRODUCT STOCK FOR OWNER
// ======================================================

async function getOwnerProductStock(ownerId, productId) {
  const stockDocument = await Stock.findOne({
    owner: ownerId,
    items: {
      $elemMatch: {
        product: productId,
      },
    },
  });

  if (!stockDocument) {
    return {
      stockDocument: null,
      stockItem: null,
    };
  }

  const stockItem = stockDocument.items.find(
    (item) =>
      String(item.product) === String(productId)
  );

  return {
    stockDocument,
    stockItem: stockItem || null,
  };
}

// ======================================================
// CREATE ORDER
// ======================================================

async function createOrder(req, res) {
  try {
    if (req.user.role !== "MEMBER") {
      return res.status(403).json({
        message: "Only Member can create an order",
      });
    }

    const { seller, items } = req.body;

    if (!seller) {
      return res.status(400).json({
        message: "Team Leader is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    const teamLeader = await User.findOne({
      _id: seller,
      role: "TEAM_LEADER",
      status: "ACTIVE",
    });

    if (!teamLeader) {
      return res.status(400).json({
        message: "Selected Team Leader is not active",
      });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      if (
        !item.product ||
        item.quantity === undefined
      ) {
        return res.status(400).json({
          message: "Invalid order item",
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      const product = await Product.findById(
        item.product
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const {
        stockDocument,
        stockItem,
      } = await getOwnerProductStock(
        seller,
        product._id
      );

      if (!stockDocument || !stockItem) {
        return res.status(400).json({
          message:
            `${product.name} is not available with selected Team Leader`,
        });
      }

      const availableStock = Number(
        stockItem.quantity || 0
      );

      if (availableStock < quantity) {
        return res.status(400).json({
          message:
            `${product.name} is out of stock with selected Team Leader. ` +
            `Available stock: ${availableStock}`,
        });
      }

      const price = Number(
        product.price || 0
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          message:
            `Invalid product price for ${product.name}`,
        });
      }

      const itemTotal = price * quantity;

      orderItems.push({
        product: product._id,
        quantity,
        price,
      });

      total += itemTotal;
    }

    const order = await Order.create({
      buyer: req.user.id,
      seller,
      items: orderItems,
      total,
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      message: "Unable to create order",
      error: error.message,
    });
  }
}

// ======================================================
// LIST ORDERS
// ======================================================

async function listOrders(req, res) {
  try {
    let filter = {};

    if (req.user.role === "MEMBER") {
      filter = {
        buyer: req.user.id,
      };
    } else if (
      req.user.role === "TEAM_LEADER"
    ) {
      filter = {
        seller: req.user.id,
      };
    } else {
      return res.status(403).json({
        message:
          "You do not have permission to view orders",
      });
    }

    const orders = await Order.find(filter)
      .populate(
        "buyer",
        "name email phone mobile"
      )
      .populate(
        "seller",
        "name email phone mobile"
      )
      .populate(
        "items.product",
        "name price image"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      orders,
    });
  } catch (error) {
    console.error(
      "List orders error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load orders",
      error: error.message,
    });
  }
}

// ======================================================
// GET ORDER BY ID
// ======================================================

async function getOrderById(req, res) {
  try {
    const order =
      await Order.findById(req.params.id)
        .populate(
          "buyer",
          "name email phone"
        )
        .populate(
          "seller",
          "name email phone"
        )
        .populate(
          "items.product",
          "name price image"
        );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (req.user.role === "MEMBER") {
      if (
        String(
          order.buyer?._id ||
            order.buyer
        ) !== String(req.user.id)
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
    }

    if (req.user.role === "TEAM_LEADER") {
      if (
        String(
          order.seller?._id ||
            order.seller
        ) !== String(req.user.id)
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }
    }

    if (
      req.user.role === "CASH_MANAGER" ||
      req.user.role === "ADMIN" ||
      req.user.role === "SUPER_ADMIN"
    ) {
      // Allowed
    }

    return res.json({
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load order",
      error: error.message,
    });
  }
}

// ======================================================
// HELPER: GET OR CREATE CASH WALLET
// ======================================================

async function getOrCreateCashWallet(userId) {
  let wallet =
    await CashWallet.findOne({
      user: userId,
    });

  if (!wallet) {
    wallet = await CashWallet.create({
      user: userId,
      availableBalance: 0,
      pendingBalance: 0,
      totalCollected: 0,
      totalReceived: 0,
      totalTransferred: 0,
    });
  }

  return wallet;
}

// ======================================================
// COLLECT CASH AGAINST ORDER
// ======================================================
// IMPORTANT:
// Accepts both:
// { amount: 1000 }
// and
// { cashAmount: 1000 }
// ======================================================

async function collectCash(req, res) {
  try {
    const { id } = req.params;

    const amountFromBody =
      req.body?.amount ??
      req.body?.cashAmount;

    const note =
      req.body?.note ||
      "Cash collected by Team Leader";

    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message:
          "Only Team Leader can collect cash",
      });
    }

    if (
      amountFromBody === undefined ||
      amountFromBody === null
    ) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const cashAmount =
      Number(amountFromBody);

    if (
      !Number.isFinite(cashAmount) ||
      cashAmount <= 0
    ) {
      return res.status(400).json({
        message: "Invalid cash amount",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ==================================================
    // SELLER CHECK
    // ==================================================

    if (
      !order.seller ||
      String(order.seller) !==
        String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          "You are not the seller of this order",
      });
    }

    // ==================================================
    // ORDER STATUS
    // ==================================================

    if (
      order.status === "CANCELLED"
    ) {
      return res.status(400).json({
        message:
          "Cancelled order cannot receive cash",
      });
    }

    if (
      order.status === "CONFIRMED"
    ) {
      return res.status(400).json({
        message:
          "Cash cannot be collected for an already confirmed order",
      });
    }

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    if (
      order.paymentStatus === "PAID"
    ) {
      return res.status(400).json({
        message:
          "Cash has already been collected for this order",
      });
    }

    // ==================================================
    // ORDER TOTAL
    // ==================================================

    const orderTotal =
      Number(order.total || 0);

    if (
      !Number.isFinite(orderTotal) ||
      orderTotal <= 0
    ) {
      return res.status(400).json({
        message: "Invalid order total",
      });
    }

    // ==================================================
    // EXACT CASH
    // ==================================================

    if (
      cashAmount !== orderTotal
    ) {
      return res.status(400).json({
        message:
          `Cash amount must be exactly ₹${orderTotal}`,
      });
    }

    // ==================================================
    // DUPLICATE TRANSACTION CHECK
    // ==================================================

    const existingTransaction =
      await CashTransaction.findOne({
        order: order._id,
        type:
          "MEMBER_TO_TEAM_LEADER",
      });

    if (existingTransaction) {
      return res.status(400).json({
        message:
          "Cash has already been collected for this order",
      });
    }

    // ==================================================
    // GET TEAM LEADER CASH WALLET
    // ==================================================

    const cashWallet =
      await getOrCreateCashWallet(
        req.user.id
      );

    // ==================================================
    // CREATE CASH TRANSACTION
    // ==================================================

    const transaction =
      await CashTransaction.create({
        order: order._id,
        from: order.buyer,
        to: req.user.id,
        amount: cashAmount,
        type:
          "MEMBER_TO_TEAM_LEADER",
        status: "APPROVED",
        note,
      });

    // ==================================================
    // SAVE CASH IN TEAM LEADER WALLET
    // ==================================================

    cashWallet.availableBalance =
      Number(
        cashWallet.availableBalance || 0
      ) + cashAmount;

    cashWallet.totalCollected =
      Number(
        cashWallet.totalCollected || 0
      ) + cashAmount;

    await cashWallet.save();

    // ==================================================
    // MARK ORDER PAYMENT AS PAID
    // ==================================================

    order.paymentStatus =
      "PAID";

    await order.save();

    return res.json({
      message:
        "Cash collected successfully",

      transaction,

      cashWallet: {
        user: cashWallet.user,
        availableBalance:
          cashWallet.availableBalance,
        pendingBalance:
          cashWallet.pendingBalance,
        totalCollected:
          cashWallet.totalCollected,
        totalReceived:
          cashWallet.totalReceived,
        totalTransferred:
          cashWallet.totalTransferred,
      },
    });
  } catch (error) {
    console.error(
      "Order collect cash error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to collect cash",
      error: error.message,
    });
  }
}

// ======================================================
// CONFIRM ORDER
// ======================================================

async function confirmOrder(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role !== "TEAM_LEADER") {
      return res.status(403).json({
        message:
          "Only Team Leader can confirm order",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      !order.seller ||
      String(order.seller) !==
        String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          "You are not the seller of this order",
      });
    }

    if (
      order.status === "CANCELLED"
    ) {
      return res.status(400).json({
        message:
          "Cancelled order cannot be confirmed",
      });
    }

    if (
      order.status === "CONFIRMED"
    ) {
      return res.status(400).json({
        message:
          "Order is already confirmed",
      });
    }

    if (
      order.paymentStatus !== "PAID"
    ) {
      return res.status(400).json({
        message:
          "Cash payment must be collected first",
      });
    }

    // ==================================================
    // VERIFY ALL STOCK FIRST
    // ==================================================

    const stockUpdates = [];

    for (const item of order.items) {
      const quantity =
        Number(item.quantity || 0);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid product quantity in order",
        });
      }

      const {
        stockDocument,
        stockItem,
      } =
        await getOwnerProductStock(
          order.seller,
          item.product
        );

      if (
        !stockDocument ||
        !stockItem
      ) {
        return res.status(400).json({
          message:
            "Stock not found for one of the products",
        });
      }

      const availableStock =
        Number(
          stockItem.quantity || 0
        );

      if (
        availableStock < quantity
      ) {
        return res.status(400).json({
          message:
            "Insufficient stock for one of the products",
        });
      }

      stockUpdates.push({
        stockDocument,
        stockItem,
        quantity,
      });
    }

    // ==================================================
    // REDUCE STOCK
    // ==================================================

    for (const update of stockUpdates) {
      update.stockItem.quantity =
        Number(
          update.stockItem.quantity || 0
        ) - update.quantity;

      await update.stockDocument.save();
    }

    // ==================================================
    // CONFIRM ORDER
    // ==================================================

    order.status =
      "CONFIRMED";

    await order.save();

    // ==================================================
    // CREATE COMMISSIONS
    // ==================================================

    try {
      await createCommissionsForOrder(
        order
      );
    } catch (commissionError) {
      console.error(
        "Commission creation error:",
        commissionError
      );
    }

    return res.json({
      message:
        "Order confirmed successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Confirm order error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to confirm order",
      error: error.message,
    });
  }
}

// ======================================================
// UPDATE PAYMENT
// ======================================================

async function updatePayment(req, res) {
  try {
    const { id } =
      req.params;

    const {
      paymentStatus,
    } = req.body;

    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({
        message:
          "Only Admin can update payment",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "SUBMITTED",
      "PAID",
      "APPROVED",
      "REJECTED",
    ];

    if (
      !allowedStatuses.includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment status",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }

    if (
      order.paymentMethod ===
        "CASH" &&
      order.status ===
        "CONFIRMED" &&
      paymentStatus !==
        "PAID"
    ) {
      return res.status(400).json({
        message:
          "Confirmed cash order payment cannot be changed",
      });
    }

    order.paymentStatus =
      paymentStatus;

    await order.save();

    return res.json({
      message:
        "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Update payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update payment",
      error: error.message,
    });
  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  collectCash,
  confirmOrder,
  updatePayment,
  getOrCreateCashWallet,
};