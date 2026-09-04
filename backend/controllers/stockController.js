const Product = require("../models/Product");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const User = require("../models/User");

// ======================================================
// CONSTANTS
// ======================================================

const STOCK_ROLES = [
  "DISTRIBUTION_MANAGER",
  "SUPER_TEAM_LEADER",
  "TEAM_LEADER"
];

// ======================================================
// HELPER - CHECK STOCK ROLE
// ======================================================

function isStockUser(role) {
  return STOCK_ROLES.includes(role);
}

// ======================================================
// HELPER - ADD STOCK
// ======================================================

async function addStock(ownerId, productId, quantity) {
  let stock = await Stock.findOne({
    owner: ownerId
  });

  if (!stock) {
    stock = await Stock.create({
      owner: ownerId,
      items: []
    });
  }

  const existingItem = stock.items.find(
    item =>
      String(item.product) === String(productId)
  );

  if (existingItem) {
    existingItem.quantity =
      Number(existingItem.quantity || 0) +
      Number(quantity);
  } else {
    stock.items.push({
      product: productId,
      quantity: Number(quantity),
      lowStockThreshold: 0
    });
  }

  await stock.save();

  return stock;
}

// ======================================================
// HELPER - REMOVE STOCK
// ======================================================

async function removeStock(ownerId, productId, quantity) {
  const stock = await Stock.findOne({
    owner: ownerId
  });

  if (!stock) {
    return {
      success: false,
      message: "Sender stock not found"
    };
  }

  const item = stock.items.find(
    item =>
      String(item.product) === String(productId)
  );

  if (!item) {
    return {
      success: false,
      message: "Sender does not have this product"
    };
  }

  const available = Number(item.quantity || 0);
  const requested = Number(quantity);

  if (available < requested) {
    return {
      success: false,
      message:
        `Insufficient stock. Available stock: ${available}`
    };
  }

  item.quantity = available - requested;

  await stock.save();

  return {
    success: true,
    stock
  };
}

// ======================================================
// HELPER - BUILD DATE FILTER
// ======================================================

function buildDateFilter(fromDate, toDate) {
  const filter = {};

  if (fromDate) {
    const start = new Date(
      `${fromDate}T00:00:00.000`
    );

    if (!Number.isNaN(start.getTime())) {
      filter.$gte = start;
    }
  }

  if (toDate) {
    const end = new Date(
      `${toDate}T23:59:59.999`
    );

    if (!Number.isNaN(end.getTime())) {
      filter.$lte = end;
    }
  }

  if (Object.keys(filter).length > 0) {
    return {
      createdAt: filter
    };
  }

  return {};
}

// ======================================================
// HELPER - GET STOCK WITH PRODUCTS
// ======================================================

async function getUserStock(ownerId) {
  return Stock.findOne({
    owner: ownerId
  }).populate({
    path: "items.product",
    select:
      "name sku price images image category stock lowStockThreshold status"
  });
}

// ======================================================
// TRANSFER STOCK
// ======================================================

async function transferStock(req, res) {
  try {
    const {
      productId,
      toUserId,
      quantity,
      type,
      note
    } = req.body;

    // ================================================
    // VALIDATION
    // ================================================

    if (
      !productId ||
      !toUserId ||
      quantity === undefined ||
      !type
    ) {
      return res.status(400).json({
        message:
          "productId, toUserId, quantity and type are required"
      });
    }

    const transferQuantity = Number(quantity);

    if (
      !Number.isInteger(transferQuantity) ||
      transferQuantity <= 0
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a positive whole number"
      });
    }

    // ================================================
    // PRODUCT
    // ================================================

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Product is not active"
      });
    }

    // ================================================
    // RECEIVER
    // ================================================

    const receiver = await User.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found"
      });
    }

    if (receiver.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Receiver account is not active"
      });
    }

    const senderId = req.user.id;

    // ==================================================
    // COMPANY
    // →
    // DISTRIBUTION MANAGER
    // ==================================================

    if (type === "COMPANY_TO_DISTRIBUTOR") {
      if (
        ![
          "PRODUCT_MANAGER",
          "ADMIN",
          "SUPER_ADMIN"
        ].includes(req.user.role)
      ) {
        return res.status(403).json({
          message:
            "Only Product Manager or Admin can transfer company stock"
        });
      }

      if (
        receiver.role !==
        "DISTRIBUTION_MANAGER"
      ) {
        return res.status(400).json({
          message:
            "Receiver must be a DISTRIBUTION_MANAGER"
        });
      }

      const companyStock =
        Number(product.stock || 0);

      if (
        companyStock <
        transferQuantity
      ) {
        return res.status(400).json({
          message:
            `Insufficient company stock. Available stock: ${companyStock}`
        });
      }

      // Reduce company stock
      product.stock =
        companyStock -
        transferQuantity;

      await product.save();

      // Add distributor stock
      const receiverStock =
        await addStock(
          receiver._id,
          product._id,
          transferQuantity
        );

      // Transaction
      const transaction =
        await StockTransaction.create({
          product: product._id,
          from: senderId,
          to: receiver._id,
          quantity: transferQuantity,
          type: "COMPANY_TO_DISTRIBUTOR",
          note:
            note?.trim() ||
            "Company stock transferred to Distribution Manager"
        });

      await transaction.populate(
        "product",
        "name sku price images image"
      );

      await transaction.populate(
        "from",
        "name email phone role"
      );

      await transaction.populate(
        "to",
        "name email phone role"
      );

      return res.status(200).json({
        message:
          "Stock transferred successfully",

        transfer: {
          productId: product._id,
          productName: product.name,
          quantity: transferQuantity,

          companyStockBefore:
            companyStock,

          companyStockAfter:
            product.stock,

          receiver: {
            id: receiver._id,
            name: receiver.name,
            email: receiver.email,
            phone: receiver.phone,
            role: receiver.role
          }
        },

        stock: receiverStock,

        transaction
      });
    }

    // ==================================================
    // DISTRIBUTION MANAGER
    // →
    // SUPER TEAM LEADER
    // ==================================================

    if (
      type ===
      "DISTRIBUTOR_TO_SUPER_TEAM_LEADER"
    ) {
      if (
        req.user.role !==
        "DISTRIBUTION_MANAGER"
      ) {
        return res.status(403).json({
          message:
            "Only Distribution Manager can transfer this stock"
        });
      }

      if (
        receiver.role !==
        "SUPER_TEAM_LEADER"
      ) {
        return res.status(400).json({
          message:
            "Receiver must be a SUPER_TEAM_LEADER"
        });
      }

      const removed =
        await removeStock(
          senderId,
          productId,
          transferQuantity
        );

      if (!removed.success) {
        return res.status(400).json({
          message: removed.message
        });
      }

      const receiverStock =
        await addStock(
          receiver._id,
          productId,
          transferQuantity
        );

      const transaction =
        await StockTransaction.create({
          product: productId,
          from: senderId,
          to: receiver._id,
          quantity: transferQuantity,
          type:
            "DISTRIBUTOR_TO_SUPER_TEAM_LEADER",
          note:
            note?.trim() ||
            "Distribution Manager transferred stock to Super Team Leader"
        });

      await transaction.populate(
        "product",
        "name sku price images image"
      );

      await transaction.populate(
        "from",
        "name email phone role"
      );

      await transaction.populate(
        "to",
        "name email phone role"
      );

      return res.status(200).json({
        message:
          "Stock transferred successfully",

        stock: receiverStock,

        transaction
      });
    }

    // ==================================================
    // SUPER TEAM LEADER
    // →
    // TEAM LEADER
    // ==================================================

    if (
      type ===
      "SUPER_TEAM_LEADER_TO_TEAM_LEADER"
    ) {
      if (
        req.user.role !==
        "SUPER_TEAM_LEADER"
      ) {
        return res.status(403).json({
          message:
            "Only Super Team Leader can transfer this stock"
        });
      }

      if (
        receiver.role !==
        "TEAM_LEADER"
      ) {
        return res.status(400).json({
          message:
            "Receiver must be a TEAM_LEADER"
        });
      }

      const removed =
        await removeStock(
          senderId,
          productId,
          transferQuantity
        );

      if (!removed.success) {
        return res.status(400).json({
          message: removed.message
        });
      }

      const receiverStock =
        await addStock(
          receiver._id,
          productId,
          transferQuantity
        );

      const transaction =
        await StockTransaction.create({
          product: productId,
          from: senderId,
          to: receiver._id,
          quantity: transferQuantity,
          type:
            "SUPER_TEAM_LEADER_TO_TEAM_LEADER",
          note:
            note?.trim() ||
            "Super Team Leader transferred stock to Team Leader"
        });

      await transaction.populate(
        "product",
        "name sku price images image"
      );

      await transaction.populate(
        "from",
        "name email phone role"
      );

      await transaction.populate(
        "to",
        "name email phone role"
      );

      return res.status(200).json({
        message:
          "Stock transferred successfully",

        stock: receiverStock,

        transaction
      });
    }

    // ==================================================
    // INVALID TYPE
    // ==================================================

    return res.status(400).json({
      message:
        "Invalid stock transaction type"
    });

  } catch (error) {
    console.error(
      "Transfer stock error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to transfer stock"
    });
  }
}

// ======================================================
// MY STOCK
// ======================================================

async function myStock(req, res) {
  try {
    if (!isStockUser(req.user.role)) {
      return res.status(403).json({
        message:
          "Stock access is not available for this role"
      });
    }

    const stock =
      await getUserStock(req.user.id);

    if (!stock) {
      return res.json({
        stock: {
          owner: req.user.id,
          items: []
        }
      });
    }

    const stockData =
      stock.toObject();

    stockData.items =
      stockData.items.map(item => {
        const quantity =
          Number(item.quantity || 0);

        const threshold =
          Number(
            item.lowStockThreshold || 0
          );

        return {
          ...item,

          quantity,

          lowStockThreshold:
            threshold,

          isLowStock:
            threshold > 0 &&
            quantity <= threshold
        };
      });

    return res.json({
      stock: stockData
    });

  } catch (error) {
    console.error(
      "My stock error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load stock"
    });
  }
}

// ======================================================
// TEAM LEADER STOCK
// ======================================================

async function teamLeaderStock(req, res) {
  try {
    if (
      req.user.role !==
      "TEAM_LEADER"
    ) {
      return res.status(403).json({
        message:
          "Only Team Leader can access this stock"
      });
    }

    const stock =
      await getUserStock(req.user.id);

    if (!stock) {
      return res.json({
        stock: {
          owner: req.user.id,
          items: []
        }
      });
    }

    const stockData =
      stock.toObject();

    stockData.items =
      stockData.items.map(item => {
        const quantity =
          Number(item.quantity || 0);

        const threshold =
          Number(
            item.lowStockThreshold || 0
          );

        return {
          ...item,

          quantity,

          lowStockThreshold:
            threshold,

          isLowStock:
            threshold > 0 &&
            quantity <= threshold
        };
      });

    return res.json({
      stock: stockData
    });

  } catch (error) {
    console.error(
      "Team Leader stock error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load Team Leader stock"
    });
  }
}

// ======================================================
// MEMBER - VIEW TEAM LEADER STOCK
// ======================================================

async function memberTeamLeaderStock(
  req,
  res
) {
  try {
    if (
      req.user.role !==
      "MEMBER"
    ) {
      return res.status(403).json({
        message:
          "Only Member can access Team Leader stock"
      });
    }

    const {
      teamLeaderId
    } = req.params;

    if (!teamLeaderId) {
      return res.status(400).json({
        message:
          "Team Leader ID is required"
      });
    }

    const teamLeader =
      await User.findOne({
        _id: teamLeaderId,
        role: "TEAM_LEADER",
        status: "ACTIVE"
      }).select(
        "name email phone city district state pincode role status"
      );

    if (!teamLeader) {
      return res.status(404).json({
        message:
          "Team Leader not found"
      });
    }

    const stock =
      await getUserStock(
        teamLeader._id
      );

    if (!stock) {
      return res.json({
        teamLeader,

        stock: {
          owner: teamLeader._id,
          items: []
        }
      });
    }

    const stockData =
      stock.toObject();

    stockData.items =
      stockData.items
        .filter(item => item.product)
        .map(item => {
          const quantity =
            Number(item.quantity || 0);

          const threshold =
            Number(
              item.lowStockThreshold || 0
            );

          return {
            ...item,

            quantity,

            lowStockThreshold:
              threshold,

            isLowStock:
              threshold > 0 &&
              quantity <= threshold
          };
        });

    return res.json({
      teamLeader,
      stock: stockData
    });

  } catch (error) {
    console.error(
      "Member Team Leader stock error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load Team Leader stock"
    });
  }
}

// ======================================================
// SET LOW STOCK THRESHOLD
// ======================================================

async function setLowStockThreshold(
  req,
  res
) {
  try {
    if (
      !isStockUser(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Only Distribution Manager, Super Team Leader and Team Leader can set stock limits"
      });
    }

    const value =
      Number(req.body.threshold);

    if (
      !Number.isInteger(value) ||
      value < 0
    ) {
      return res.status(400).json({
        message:
          "Threshold must be a non-negative whole number"
      });
    }

    const product =
      await Product.findById(
        req.params.productId
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found"
      });
    }

    let stock =
      await Stock.findOne({
        owner: req.user.id
      });

    if (!stock) {
      stock =
        await Stock.create({
          owner: req.user.id,
          items: []
        });
    }

    const item =
      stock.items.find(
        item =>
          String(item.product) ===
          String(product._id)
      );

    if (!item) {
      stock.items.push({
        product: product._id,
        quantity: 0,
        lowStockThreshold: value
      });
    } else {
      item.lowStockThreshold =
        value;
    }

    await stock.save();

    const updatedStock =
      await getUserStock(
        req.user.id
      );

    return res.json({
      message:
        "Low stock limit updated successfully",

      threshold: value,

      stock: updatedStock
    });

  } catch (error) {
    console.error(
      "Set low stock threshold error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to update low stock limit"
    });
  }
}

// ======================================================
// LOW STOCK PRODUCTS
// ======================================================

async function lowStockProducts(
  req,
  res
) {
  try {
    if (
      !isStockUser(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Only stock users can access low stock list"
      });
    }

    const stock =
      await getUserStock(
        req.user.id
      );

    if (!stock) {
      return res.json({
        count: 0,
        products: []
      });
    }

    const products =
      stock.items
        .filter(
          item => item.product
        )
        .map(item => {
          const quantity =
            Number(item.quantity || 0);

          const threshold =
            Number(
              item.lowStockThreshold || 0
            );

          return {
            productId:
              item.product._id,

            name:
              item.product.name,

            sku:
              item.product.sku,

            price:
              item.product.price,

            images:
              item.product.images,

            quantity,

            lowStockThreshold:
              threshold,

            shortage:
              Math.max(
                threshold - quantity,
                0
              ),

            stockValue:
              quantity *
              Number(
                item.product.price || 0
              ),

            isLowStock:
              threshold > 0 &&
              quantity <= threshold
          };
        })
        .filter(
          item =>
            item.isLowStock
        )
        .sort(
          (a, b) =>
            a.quantity - b.quantity
        );

    return res.json({
      count: products.length,
      products
    });

  } catch (error) {
    console.error(
      "Low stock products error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load low stock products"
    });
  }
}

// ======================================================
// MY TRANSACTIONS
// ======================================================

async function myTransactions(
  req,
  res
) {
  try {
    if (
      !isStockUser(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Only stock users can access transactions"
      });
    }

    const {
      fromDate,
      toDate,
      productId,
      type
    } = req.query;

    const query = {
      $or: [
        {
          from: req.user.id
        },
        {
          to: req.user.id
        }
      ]
    };

    const dateFilter =
      buildDateFilter(
        fromDate,
        toDate
      );

    if (dateFilter.createdAt) {
      query.createdAt =
        dateFilter.createdAt;
    }

    if (productId) {
      query.product =
        productId;
    }

    if (type) {
      query.type =
        type;
    }

    const transactions =
      await StockTransaction.find(
        query
      )
        .populate(
          "product",
          "name sku price images image"
        )
        .populate(
          "from",
          "name email phone role"
        )
        .populate(
          "to",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        });

    let receivedQuantity = 0;
    let transferredQuantity = 0;

    transactions.forEach(
      transaction => {
        if (
          String(transaction.to?._id) ===
          String(req.user.id)
        ) {
          receivedQuantity +=
            Number(
              transaction.quantity || 0
            );
        }

        if (
          String(transaction.from?._id) ===
          String(req.user.id)
        ) {
          transferredQuantity +=
            Number(
              transaction.quantity || 0
            );
        }
      }
    );

    return res.json({
      count:
        transactions.length,

      summary: {
        receivedQuantity,
        transferredQuantity,

        netMovement:
          receivedQuantity -
          transferredQuantity
      },

      filters: {
        fromDate:
          fromDate || null,

        toDate:
          toDate || null,

        productId:
          productId || null,

        type:
          type || null
      },

      transactions
    });

  } catch (error) {
    console.error(
      "Transactions error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load transactions"
    });
  }
}

// ======================================================
// DISTRIBUTION MANAGER STOCK OVERVIEW
// ======================================================

async function distributionManagerStocks(
  req,
  res
) {
  try {
    if (
      ![
        "ADMIN",
        "SUPER_ADMIN",
        "PRODUCT_MANAGER"
      ].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message:
          "Only Admin, Super Admin or Product Manager can view Distribution Manager stock"
      });
    }

    const managers =
      await User.find({
        role:
          "DISTRIBUTION_MANAGER",

        status:
          "ACTIVE"
      })
        .select(
          "name email phone address city district state pincode role status"
        )
        .sort({
          name: 1
        });

    const managerIds =
      managers.map(
        manager =>
          manager._id
      );

    const stocks =
      await Stock.find({
        owner: {
          $in: managerIds
        }
      }).populate({
        path:
          "items.product",

        select:
          "name sku price images image category status"
      });

    const stockMap =
      new Map();

    stocks.forEach(stock => {
      stockMap.set(
        String(stock.owner),
        stock
      );
    });

    const productTotals =
      new Map();

    let grandTotalQuantity = 0;

    const distributionManagers =
      managers.map(manager => {
        const stock =
          stockMap.get(
            String(manager._id)
          );

        const items =
          stock?.items || [];

        let totalQuantity = 0;

        const products =
          items
            .filter(
              item =>
                item.product
            )
            .map(item => {
              const quantity =
                Number(
                  item.quantity || 0
                );

              const threshold =
                Number(
                  item.lowStockThreshold || 0
                );

              const isLowStock =
                threshold > 0 &&
                quantity <= threshold;

              totalQuantity +=
                quantity;

              grandTotalQuantity +=
                quantity;

              const productId =
                String(
                  item.product._id
                );

              productTotals.set(
                productId,
                (
                  productTotals.get(
                    productId
                  ) || 0
                ) + quantity
              );

              return {
                productId:
                  item.product._id,

                name:
                  item.product.name,

                sku:
                  item.product.sku,

                price:
                  item.product.price,

                images:
                  item.product.images,

                quantity,

                lowStockThreshold:
                  threshold,

                isLowStock,

                stockValue:
                  quantity *
                  Number(
                    item.product.price || 0
                  )
              };
            });

        return {
          distributor: {
            id:
              manager._id,

            name:
              manager.name,

            email:
              manager.email,

            phone:
              manager.phone,

            address:
              manager.address,

            city:
              manager.city,

            district:
              manager.district,

            state:
              manager.state,

            pincode:
              manager.pincode,

            role:
              manager.role,

            status:
              manager.status
          },

          totalQuantity,

          lowStockProducts:
            products.filter(
              product =>
                product.isLowStock
            ).length,

          products
        };
      });

    const productTotalIds =
      Array.from(
        productTotals.keys()
      );

    const productTotalProducts =
      await Product.find({
        _id: {
          $in:
            productTotalIds
        }
      }).select(
        "name sku price images image"
      );

    const productMap =
      new Map();

    productTotalProducts.forEach(
      product => {
        productMap.set(
          String(product._id),
          product
        );
      }
    );

    const productWiseTotals =
      Array.from(
        productTotals.entries()
      )
        .map(
          ([productId, quantity]) => {
            const product =
              productMap.get(
                String(productId)
              );

            return {
              productId,

              name:
                product?.name ||
                "Unknown Product",

              sku:
                product?.sku ||
                "-",

              price:
                product?.price ||
                0,

              quantity,

              stockValue:
                quantity *
                Number(
                  product?.price || 0
                )
            };
          }
        )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
        );

    return res.json({
      summary: {
        totalDistributors:
          distributionManagers.length,

        totalStock:
          grandTotalQuantity,

        totalProducts:
          productWiseTotals.length
      },

      distributionManagers,

      productWiseTotals
    });

  } catch (error) {
    console.error(
      "Distribution Manager stock overview error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load Distribution Manager stocks"
    });
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  transferStock,
  myStock,
  teamLeaderStock,
  memberTeamLeaderStock,
  setLowStockThreshold,
  lowStockProducts,
  distributionManagerStocks,
  myTransactions
};