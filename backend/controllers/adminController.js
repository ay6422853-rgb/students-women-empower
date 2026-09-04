const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Commission = require("../models/Commission");
const Wallet = require("../models/Wallet");
const CashWallet = require("../models/CashWallet");
const Withdrawal = require("../models/Withdrawal");
const CashTransaction = require("../models/CashTransaction");
const Stock = require("../models/Stock");
const StockTransaction = require("../models/StockTransaction");
const ActivityLog = require("../models/ActivityLog");

// ======================================================
// CONSTANTS
// ======================================================

const ADMIN_ROLES = [
  "ADMIN",
  "SUPER_ADMIN"
];

const VALID_ROLES = [
  "MEMBER",
  "TEAM_LEADER",
  "SUPER_TEAM_LEADER",
  "CHIEF_TEAM_OFFICER",
  "PRODUCT_MANAGER",
  "CASH_MANAGER",
  "DISTRIBUTION_MANAGER",
  "ADMIN"
];

const VALID_STATUSES = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED"
];

// ======================================================
// ADMIN CHECK
// ======================================================

function isAdmin(req) {
  return (
    req.user &&
    ADMIN_ROLES.includes(req.user.role)
  );
}

// ======================================================
// DATE FILTER
// ======================================================

function getDateRange(query) {
  const {
    period,
    fromDate,
    toDate
  } = query;

  let start = null;
  let end = new Date();

  end.setHours(23, 59, 59, 999);

  const now = new Date();

  // Custom date
  if (fromDate || toDate) {
    if (fromDate) {
      start = new Date(`${fromDate}T00:00:00.000`);
    }

    if (toDate) {
      end = new Date(`${toDate}T23:59:59.999`);
    }

    return {
      start,
      end
    };
  }

  switch (period) {

    case "TODAY":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;

    case "YESTERDAY":
      start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;

    case "LAST_7_DAYS":
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case "LAST_15_DAYS":
      start = new Date(now);
      start.setDate(start.getDate() - 14);
      start.setHours(0, 0, 0, 0);
      break;

    case "LAST_30_DAYS":
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case "THIS_WEEK": {
      start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;

      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      break;
    }

    case "LAST_WEEK": {
      start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;

      start.setDate(start.getDate() - diff - 7);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case "THIS_MONTH":
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      break;

    case "LAST_MONTH":
      start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

      end.setHours(23, 59, 59, 999);
      break;

    case "THIS_QUARTER": {
      const quarter =
        Math.floor(now.getMonth() / 3);

      start = new Date(
        now.getFullYear(),
        quarter * 3,
        1
      );

      break;
    }

    case "LAST_QUARTER": {
      const quarter =
        Math.floor(now.getMonth() / 3);

      start = new Date(
        now.getFullYear(),
        quarter * 3 - 3,
        1
      );

      end = new Date(
        now.getFullYear(),
        quarter * 3,
        0
      );

      end.setHours(23, 59, 59, 999);
      break;
    }

    case "THIS_HALF_YEAR": {
      const month =
        now.getMonth() < 6 ? 0 : 6;

      start = new Date(
        now.getFullYear(),
        month,
        1
      );

      break;
    }

    case "LAST_HALF_YEAR": {
      const month =
        now.getMonth() < 6 ? 0 : 6;

      start = new Date(
        now.getFullYear(),
        month - 6,
        1
      );

      end = new Date(
        now.getFullYear(),
        month,
        0
      );

      end.setHours(23, 59, 59, 999);
      break;
    }

    case "THIS_YEAR":
      start = new Date(
        now.getFullYear(),
        0,
        1
      );
      break;

    case "LAST_YEAR":
      start = new Date(
        now.getFullYear() - 1,
        0,
        1
      );

      end = new Date(
        now.getFullYear(),
        0,
        0
      );

      end.setHours(23, 59, 59, 999);
      break;

    case "FINANCIAL_YEAR": {
      const year =
        now.getMonth() >= 3
          ? now.getFullYear()
          : now.getFullYear() - 1;

      start = new Date(
        year,
        3,
        1
      );

      end = new Date(
        year + 1,
        2,
        31
      );

      end.setHours(23, 59, 59, 999);
      break;
    }

    default:
      break;
  }

  return {
    start,
    end
  };
}

// ======================================================
// BUILD USER FILTER
// ======================================================

function buildUserFilter(query) {

  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.city) {
    filter.city = new RegExp(
      query.city,
      "i"
    );
  }

  if (query.district) {
    filter.district = new RegExp(
      query.district,
      "i"
    );
  }

  if (query.state) {
    filter.state = new RegExp(
      query.state,
      "i"
    );
  }

  if (query.pincode) {
    filter.pincode = query.pincode;
  }

  if (query.address) {
    filter.address = new RegExp(
      query.address,
      "i"
    );
  }

  if (query.search) {
    filter.$or = [
      {
        name: new RegExp(
          query.search,
          "i"
        )
      },
      {
        email: new RegExp(
          query.search,
          "i"
        )
      },
      {
        phone: new RegExp(
          query.search,
          "i"
        )
      },
      {
        referralCode: new RegExp(
          query.search,
          "i"
        )
      }
    ];
  }

  if (query.teamLeader) {
    filter.teamLeader =
      query.teamLeader;
  }

  if (query.superTeamLeader) {
    filter.superTeamLeader =
      query.superTeamLeader;
  }

  if (query.sellingTeamLeader) {
    filter.sellingTeamLeader =
      query.sellingTeamLeader;
  }

  return filter;
}

// ======================================================
// ACTIVITY LOGGER
// ======================================================

async function logActivity(
  req,
  action,
  targetType = "",
  targetId = null,
  description = "",
  metadata = {}
) {
  try {

    await ActivityLog.create({
      actor: req.user.id,
      action,
      targetType,
      targetId,
      description,
      metadata,
      ipAddress:
        req.ip || ""
    });

  } catch (error) {
    console.error(
      "Activity log error:",
      error.message
    );
  }
}

// ======================================================
// DASHBOARD
// ======================================================

async function dashboard(req, res) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const dateFilter =
      start || end
        ? {
            createdAt: {
              ...(start
                ? { $gte: start }
                : {}),
              ...(end
                ? { $lte: end }
                : {})
            }
          }
        : {};

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,

      students,
      women,

      products,
      activeProducts,

      orders,
      confirmedOrders,

      revenue,
      commissions,

      pendingPayments,
      withdrawals,

      roleCounts,

      recentUsers,
      recentOrders,
      recentPayments
    ] = await Promise.all([

      User.countDocuments(dateFilter),

      User.countDocuments({
        ...dateFilter,
        status: "ACTIVE"
      }),

      User.countDocuments({
        ...dateFilter,
        status: "PENDING"
      }),

      User.countDocuments({
        ...dateFilter,
        status: "SUSPENDED"
      }),

      User.countDocuments({
        ...dateFilter,
        category: "STUDENT"
      }),

      User.countDocuments({
        ...dateFilter,
        category: "WOMEN"
      }),

      Product.countDocuments(
        dateFilter
      ),

      Product.countDocuments({
        ...dateFilter,
        status: "ACTIVE"
      }),

      Order.countDocuments(
        dateFilter
      ),

      Order.countDocuments({
        ...dateFilter,
        status: "CONFIRMED"
      }),

      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "CONFIRMED"
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount"
            }
          }
        }
      ]),

      Commission.aggregate([
        {
          $match: dateFilter
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount"
            }
          }
        }
      ]),

      CashTransaction.countDocuments({
        ...dateFilter,
        status: {
          $in: [
            "PENDING",
            "SUBMITTED"
          ]
        }
      }),

      Withdrawal.countDocuments({
        ...dateFilter,
        status: "PENDING"
      }),

      User.aggregate([
        {
          $match: dateFilter
        },
        {
          $group: {
            _id: "$role",
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]),

      User.find(dateFilter)
        .select(
          "name email phone role status city district state createdAt"
        )
        .sort({
          createdAt: -1
        })
        .limit(10),

      Order.find(dateFilter)
        .populate(
          "buyer",
          "name email phone role"
        )
        .populate(
          "seller",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        })
        .limit(10),

      CashTransaction.find(dateFilter)
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
        })
        .limit(10)
    ]);

    res.json({

      filters: {
        period:
          req.query.period || null,
        fromDate:
          req.query.fromDate || null,
        toDate:
          req.query.toDate || null
      },

      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        students,
        women
      },

      roles: roleCounts,

      products: {
        total: products,
        active: activeProducts
      },

      orders: {
        total: orders,
        confirmed: confirmedOrders
      },

      sales: {
        revenue:
          revenue[0]?.total || 0
      },

      commissions: {
        total:
          commissions[0]?.total || 0
      },

      payments: {
        pending:
          pendingPayments
      },

      withdrawals: {
        pending:
          withdrawals
      },

      recent: {
        users: recentUsers,
        orders: recentOrders,
        payments: recentPayments
      }

    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load admin dashboard"
    });

  }
}

// ======================================================
// USERS
// ======================================================

async function listUsers(req, res) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter =
      buildUserFilter(
        req.query
      );

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    const users =
      await User.find(filter)
        .select(
          "-password -aadhaarNumber"
        )
        .populate(
          "teamLeader",
          "name email phone role"
        )
        .populate(
          "superTeamLeader",
          "name email phone role"
        )
        .populate(
          "sellingTeamLeader",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        });

    const userIds =
      users.map(
        user => user._id
      );

    const referralCounts =
      await User.aggregate([
        {
          $match: {
            referredBy: {
              $in: userIds
            }
          }
        },
        {
          $group: {
            _id: "$referredBy",
            count: {
              $sum: 1
            }
          }
        }
      ]);

    const referralMap =
      new Map(
        referralCounts.map(
          item => [
            String(item._id),
            item.count
          ]
        )
      );

    const sales =
      await Order.aggregate([
        {
          $match: {
            seller: {
              $in: userIds
            },
            status: "CONFIRMED"
          }
        },
        {
          $group: {
            _id: "$seller",
            sales: {
              $sum: "$totalAmount"
            },
            orders: {
              $sum: 1
            }
          }
        }
      ]);

    const salesMap =
      new Map(
        sales.map(
          item => [
            String(item._id),
            item
          ]
        )
      );

    const result =
      users.map(user => {

        const salesData =
          salesMap.get(
            String(user._id)
          ) || {
            sales: 0,
            orders: 0
          };

        return {
          ...user.toObject(),

          directReferrals:
            referralMap.get(
              String(user._id)
            ) || 0,

          sales:
            salesData.sales || 0,

          confirmedOrders:
            salesData.orders || 0
        };

      });

    // Optional sales filters
    let filtered =
      result;

    if (
      req.query.minSales
    ) {
      filtered =
        filtered.filter(
          user =>
            user.sales >=
            Number(
              req.query.minSales
            )
        );
    }

    if (
      req.query.maxSales
    ) {
      filtered =
        filtered.filter(
          user =>
            user.sales <=
            Number(
              req.query.maxSales
            )
        );
    }

    res.json({

      count:
        filtered.length,

      filters: {
        ...req.query
      },

      users:
        filtered

    });

  } catch (error) {

    console.error(
      "Admin list users error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load users"
    });

  }
}

// ======================================================
// USER PORTFOLIO
// ======================================================

async function userPortfolio(
  req,
  res
) {

  try {

    const user =
      await User.findById(
        req.params.id
      )
        .select(
          "-password -aadhaarNumber"
        )
        .populate(
          "referredBy",
          "name email phone role"
        )
        .populate(
          "teamLeader",
          "name email phone role"
        )
        .populate(
          "superTeamLeader",
          "name email phone role"
        )
        .populate(
          "sellingTeamLeader",
          "name email phone role"
        );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const [
      referrals,
      ordersBought,
      ordersSold,
      commissions,
      wallet,
      cashWallet,
      withdrawals,
      stock,
      sentStock,
      receivedStock,
      cashTransactions,
      activity
    ] = await Promise.all([

      User.find({
        referredBy: user._id
      })
        .select(
          "name email phone role status city state createdAt"
        )
        .sort({
          createdAt: -1
        }),

      Order.find({
        buyer: user._id
      })
        .populate(
          "seller",
          "name email phone role"
        )
        .populate(
          "items.product",
          "name sku price"
        )
        .sort({
          createdAt: -1
        }),

      Order.find({
        seller: user._id
      })
        .populate(
          "buyer",
          "name email phone role"
        )
        .populate(
          "items.product",
          "name sku price"
        )
        .sort({
          createdAt: -1
        }),

      Commission.find({
        $or: [
          {
            beneficiary: user._id
          },
          {
            sourceUser: user._id
          }
        ]
      })
        .populate(
          "beneficiary",
          "name email phone role"
        )
        .populate(
          "sourceUser",
          "name email phone role"
        )
        .populate(
          "order",
          "totalAmount status paymentStatus createdAt"
        )
        .sort({
          createdAt: -1
        }),

      // ================================================
      // COMMISSION WALLET
      // ================================================
      Wallet.findOne({
        user: user._id
      }),

      // ================================================
      // CASH HANDLING WALLET
      // ================================================
      CashWallet.findOne({
        user: user._id
      }),

      Withdrawal.find({
        user: user._id
      })
        .sort({
          createdAt: -1
        }),

      Stock.findOne({
        owner: user._id
      }).populate(
        "items.product",
        "name sku price stock status"
      ),

      StockTransaction.find({
        from: user._id
      })
        .populate(
          "product",
          "name sku price"
        )
        .populate(
          "to",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        }),

      StockTransaction.find({
        to: user._id
      })
        .populate(
          "product",
          "name sku price"
        )
        .populate(
          "from",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        }),

      CashTransaction.find({
        $or: [
          {
            from: user._id
          },
          {
            to: user._id
          }
        ]
      })
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
        }),

      ActivityLog.find({
        $or: [
          {
            actor: user._id
          },
          {
            targetId: user._id
          }
        ]
      })
        .populate(
          "actor",
          "name email phone role"
        )
        .sort({
          createdAt: -1
        })
        .limit(100)
    ]);

    const boughtAmount =
      ordersBought.reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount || 0
          ),
        0
      );

    const soldAmount =
      ordersSold
        .filter(
          order =>
            order.status ===
            "CONFIRMED"
        )
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.totalAmount || 0
            ),
          0
        );

    const commissionAmount =
      commissions.reduce(
        (sum, commission) =>
          sum +
          Number(
            commission.amount || 0
          ),
        0
      );

    const defaultCommissionWallet = {
      availableBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0
    };

    const defaultCashWallet = {
      availableBalance: 0,
      pendingBalance: 0,
      totalCollected: 0,
      totalReceived: 0,
      totalTransferred: 0
    };

    res.json({

      user,

      summary: {
        directReferrals:
          referrals.length,

        ordersBought:
          ordersBought.length,

        ordersSold:
          ordersSold.length,

        totalPurchase:
          boughtAmount,

        totalSales:
          soldAmount,

        totalCommission:
          commissionAmount,

        // ==============================================
        // COMMISSION WALLET
        // ==============================================
        wallet:
          wallet ||
          defaultCommissionWallet,

        // ==============================================
        // CASH WALLET
        // ==============================================
        cashWallet:
          cashWallet ||
          defaultCashWallet
      },

      referrals,
      ordersBought,
      ordersSold,
      commissions,

      // Commission wallet
      wallet,

      // Cash handling wallet
      cashWallet,

      withdrawals,
      stock,
      sentStock,
      receivedStock,
      cashTransactions,
      activity

    });

  } catch (error) {

    console.error(
      "User portfolio error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load user portfolio"
    });

  }
}

// ======================================================
// UPDATE USER
// ======================================================

async function updateUser(
  req,
  res
) {

  try {

    const allowedFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "district",
      "state",
      "pincode",
      "role",
      "status",
      "teamLeader",
      "superTeamLeader",
      "sellingTeamLeader"
    ];

    const updates = {};

    allowedFields.forEach(
      field => {

        if (
          req.body[field] !==
          undefined
        ) {
          updates[field] =
            req.body[field];
        }

      }
    );

    if (
      updates.role &&
      !VALID_ROLES.includes(
        updates.role
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid role"
      });
    }

    if (
      updates.status &&
      !VALID_STATUSES.includes(
        updates.status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid status"
      });
    }

    const oldUser =
      await User.findById(
        req.params.id
      );

    if (!oldUser) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: updates
        },
        {
          new: true,
          runValidators: true
        }
      )
        .select(
          "-password -aadhaarNumber"
        );

    await logActivity(
      req,
      "UPDATE_USER",
      "User",
      user._id,
      `Admin updated user ${user.name}`,
      {
        before: {
          role: oldUser.role,
          status: oldUser.status
        },
        after: {
          role: user.role,
          status: user.status
        },
        updates
      }
    );

    res.json({
      message:
        "User updated successfully",
      user
    });

  } catch (error) {

    console.error(
      "Admin update user error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Unable to update user"
    });

  }
}

// ======================================================
// CHANGE STATUS
// ======================================================

async function changeUserStatus(
  req,
  res
) {

  try {

    const {
      status,
      reason
    } = req.body;

    if (
      !VALID_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid status"
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const oldStatus =
      user.status;

    user.status =
      status;

    await user.save();

    await logActivity(
      req,
      "CHANGE_USER_STATUS",
      "User",
      user._id,
      reason ||
        `User status changed from ${oldStatus} to ${status}`,
      {
        oldStatus,
        newStatus: status
      }
    );

    res.json({
      message:
        "User status updated successfully",
      user
    });

  } catch (error) {

    console.error(
      "Change user status error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update user status"
    });

  }
}

// ======================================================
// CHANGE ROLE
// ======================================================

async function changeUserRole(
  req,
  res
) {

  try {

    const {
      role
    } = req.body;

    if (
      !VALID_ROLES.includes(
        role
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid role"
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const oldRole =
      user.role;

    user.role =
      role;

    await user.save();

    await logActivity(
      req,
      "CHANGE_USER_ROLE",
      "User",
      user._id,
      `Role changed from ${oldRole} to ${role}`,
      {
        oldRole,
        newRole: role
      }
    );

    res.json({
      message:
        "User role updated successfully",
      user
    });

  } catch (error) {

    console.error(
      "Change role error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update user role"
    });

  }
}

// ======================================================
// SHORTLIST USER
// ======================================================

async function shortlistUser(
  req,
  res
) {

  try {

    const {
      reason,
      criteria
    } = req.body;

    const user =
      await User.findById(
        req.params.id
      ).select(
        "-password -aadhaarNumber"
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found"
      });
    }

    const log =
      await ActivityLog.create({
        actor: req.user.id,
        action: "SHORTLIST_USER",
        targetType: "User",
        targetId: user._id,
        description:
          reason ||
          "User shortlisted by admin",
        metadata: {
          criteria:
            criteria || {}
        },
        ipAddress:
          req.ip || ""
      });

    res.json({
      message:
        "User shortlisted successfully",
      shortlist: {
        user,
        reason:
          reason || "",
        criteria:
          criteria || {},
        shortlistedAt:
          log.createdAt
      }
    });

  } catch (error) {

    console.error(
      "Shortlist user error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to shortlist user"
    });

  }
}

// ======================================================
// SHORTLISTED USERS
// ======================================================

async function shortlistedUsers(
  req,
  res
) {

  try {

    const logs =
      await ActivityLog.find({
        action:
          "SHORTLIST_USER"
      })
        .populate(
          "actor",
          "name email role"
        )
        .populate(
          "targetId",
          "name email phone role status city district state pincode"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      count:
        logs.length,
      shortlisted:
        logs
    });

  } catch (error) {

    console.error(
      "Shortlisted users error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load shortlisted users"
    });

  }
}

// ======================================================
// ORDERS
// ======================================================

async function listOrders(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.paymentStatus) {
      filter.paymentStatus =
        req.query.paymentStatus;
    }

    if (req.query.buyer) {
      filter.buyer =
        req.query.buyer;
    }

    if (req.query.seller) {
      filter.seller =
        req.query.seller;
    }

    const orders =
      await Order.find(filter)
        .populate(
          "buyer",
          "name email phone role city district state"
        )
        .populate(
          "seller",
          "name email phone role city district state"
        )
        .populate(
          "items.product",
          "name sku price category"
        )
        .sort({
          createdAt: -1
        });

    const totalSales =
      orders
        .filter(
          order =>
            order.status ===
            "CONFIRMED"
        )
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.totalAmount || 0
            ),
          0
        );

    res.json({

      count:
        orders.length,

      summary: {
        totalOrders:
          orders.length,

        confirmedOrders:
          orders.filter(
            o =>
              o.status ===
              "CONFIRMED"
          ).length,

        pendingOrders:
          orders.filter(
            o =>
              o.status ===
              "PENDING"
          ).length,

        cancelledOrders:
          orders.filter(
            o =>
              o.status ===
              "CANCELLED"
          ).length,

        totalSales

      },

      filters:
        req.query,

      orders

    });

  } catch (error) {

    console.error(
      "Admin orders error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load orders"
    });

  }
}

// ======================================================
// COMMISSIONS
// ======================================================

async function listCommissions(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.beneficiary) {
      filter.beneficiary =
        req.query.beneficiary;
    }

    const commissions =
      await Commission.find(filter)
        .populate(
          "beneficiary",
          "name email phone role"
        )
        .populate(
          "sourceUser",
          "name email phone role"
        )
        .populate(
          "order",
          "totalAmount status paymentStatus createdAt"
        )
        .sort({
          createdAt: -1
        });

    const total =
      commissions.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    res.json({
      count:
        commissions.length,

      total,

      filters:
        req.query,

      commissions
    });

  } catch (error) {

    console.error(
      "Admin commissions error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load commissions"
    });

  }
}

// ======================================================
// WITHDRAWALS
// ======================================================

async function listWithdrawals(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.user) {
      filter.user =
        req.query.user;
    }

    const withdrawals =
      await Withdrawal.find(filter)
        .populate(
          "user",
          "name email phone role city district state"
        )
        .populate(
          "processedBy",
          "name email role"
        )
        .sort({
          createdAt: -1
        });

    const totals =
      withdrawals.reduce(
        (result, item) => {

          const amount =
            Number(
              item.amount || 0
            );

          result.total +=
            amount;

          if (
            item.status ===
            "PENDING"
          ) {
            result.pending +=
              amount;
          }

          if (
            item.status ===
            "PAID"
          ) {
            result.paid +=
              amount;
          }

          if (
            item.status ===
            "REJECTED"
          ) {
            result.rejected +=
              amount;
          }

          return result;

        },
        {
          total: 0,
          pending: 0,
          paid: 0,
          rejected: 0
        }
      );

    res.json({
      count:
        withdrawals.length,
      totals,
      filters:
        req.query,
      withdrawals
    });

  } catch (error) {

    console.error(
      "Admin withdrawals error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load withdrawals"
    });

  }
}

// ======================================================
// CASH TRANSACTIONS
// ======================================================

async function listCashTransactions(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.type) {
      filter.type =
        req.query.type;
    }

    if (req.query.from) {
      filter.from =
        req.query.from;
    }

    if (req.query.to) {
      filter.to =
        req.query.to;
    }

    const transactions =
      await CashTransaction.find(
        filter
      )
        .populate(
          "from",
          "name email phone role"
        )
        .populate(
          "to",
          "name email phone role"
        )
        .populate(
          "processedBy",
          "name email role"
        )
        .populate(
          "order",
          "totalAmount status paymentStatus"
        )
        .sort({
          createdAt: -1
        });

    const total =
      transactions.reduce(
        (sum, transaction) =>
          sum +
          Number(
            transaction.amount || 0
          ),
        0
      );

    res.json({
      count:
        transactions.length,
      total,
      filters:
        req.query,
      transactions
    });

  } catch (error) {

    console.error(
      "Admin cash transactions error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load cash transactions"
    });

  }
}

// ======================================================
// STOCK OVERVIEW
// ======================================================

async function stockOverview(
  req,
  res
) {

  try {

    const stocks =
      await Stock.find({})
        .populate(
          "owner",
          "name email phone role status city district state pincode"
        )
        .populate(
          "items.product",
          "name sku price stock status"
        );

    let totalQuantity = 0;
    let totalValue = 0;
    let lowStockItems = 0;

    const owners =
      stocks.map(stock => {

        let ownerQuantity = 0;
        let ownerValue = 0;

        const items =
          stock.items
            .filter(
              item =>
                item.product
            )
            .map(item => {

              const quantity =
                Number(
                  item.quantity || 0
                );

              const price =
                Number(
                  item.product.price ||
                  0
                );

              const threshold =
                Number(
                  item.lowStockThreshold ||
                  0
                );

              const isLowStock =
                threshold > 0 &&
                quantity <=
                  threshold;

              if (
                isLowStock
              ) {
                lowStockItems++;
              }

              ownerQuantity +=
                quantity;

              ownerValue +=
                quantity *
                price;

              totalQuantity +=
                quantity;

              totalValue +=
                quantity *
                price;

              return {
                product:
                  item.product,
                quantity,
                lowStockThreshold:
                  threshold,
                isLowStock,
                stockValue:
                  quantity *
                  price
              };

            });

        return {
          owner:
            stock.owner,
          totalQuantity:
            ownerQuantity,
          totalValue:
            ownerValue,
          items
        };

      });

    res.json({

      summary: {
        totalOwners:
          owners.length,
        totalQuantity,
        totalValue,
        lowStockItems
      },

      owners

    });

  } catch (error) {

    console.error(
      "Admin stock overview error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load stock overview"
    });

  }
}

// ======================================================
// STOCK TRANSACTIONS
// ======================================================

async function listStockTransactions(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.type) {
      filter.type =
        req.query.type;
    }

    if (req.query.product) {
      filter.product =
        req.query.product;
    }

    if (req.query.from) {
      filter.from =
        req.query.from;
    }

    if (req.query.to) {
      filter.to =
        req.query.to;
    }

    const transactions =
      await StockTransaction.find(
        filter
      )
        .populate(
          "product",
          "name sku price"
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

    const received =
      transactions.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0
          ),
        0
      );

    res.json({
      count:
        transactions.length,
      totalQuantity:
        received,
      filters:
        req.query,
      transactions
    });

  } catch (error) {

    console.error(
      "Admin stock transactions error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load stock transactions"
    });

  }
}

// ======================================================
// PRODUCTS
// ======================================================

async function listProducts(
  req,
  res
) {

  try {

    const filter = {};

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    if (req.query.search) {
      filter.name =
        new RegExp(
          req.query.search,
          "i"
        );
    }

    if (req.query.minPrice) {
      filter.price = {
        $gte:
          Number(
            req.query.minPrice
          )
      };
    }

    if (req.query.maxPrice) {
      filter.price = {
        ...(filter.price || {}),
        $lte:
          Number(
            req.query.maxPrice
          )
      };
    }

    const products =
      await Product.find(filter)
        .populate(
          "category",
          "name description"
        )
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          createdAt: -1
        });

    res.json({
      count:
        products.length,
      filters:
        req.query,
      products
    });

  } catch (error) {

    console.error(
      "Admin products error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load products"
    });

  }
}

// ======================================================
// CATEGORIES
// ======================================================

async function listCategories(
  req,
  res
) {

  try {

    const categories =
      await Category.find({})
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({
          name: 1
        });

    res.json({
      count:
        categories.length,
      categories
    });

  } catch (error) {

    console.error(
      "Admin categories error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load categories"
    });

  }
}

// ======================================================
// TEAM / NETWORK
// ======================================================

async function networkOverview(
  req,
  res
) {

  try {

    const users =
      await User.find({})
        .select(
          "name email phone role status referredBy teamLeader superTeamLeader sellingTeamLeader city district state pincode createdAt"
        )
        .populate(
          "referredBy",
          "name email role"
        )
        .populate(
          "teamLeader",
          "name email role"
        )
        .populate(
          "superTeamLeader",
          "name email role"
        )
        .populate(
          "sellingTeamLeader",
          "name email role"
        )
        .sort({
          createdAt: -1
        });

    const counts =
      await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: {
              $sum: 1
            }
          }
        }
      ]);

    res.json({
      summary: {
        totalUsers:
          users.length,
        roles:
          counts
      },
      users
    });

  } catch (error) {

    console.error(
      "Network overview error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load network"
    });

  }
}

// ======================================================
// ACTIVITY LOGS
// ======================================================

async function activityLogs(
  req,
  res
) {

  try {

    const {
      start,
      end
    } = getDateRange(req.query);

    const filter = {};

    if (start || end) {
      filter.createdAt = {
        ...(start
          ? { $gte: start }
          : {}),
        ...(end
          ? { $lte: end }
          : {})
      };
    }

    if (req.query.action) {
      filter.action =
        req.query.action;
    }

    if (req.query.actor) {
      filter.actor =
        req.query.actor;
    }

    if (req.query.targetType) {
      filter.targetType =
        req.query.targetType;
    }

    const logs =
      await ActivityLog.find(
        filter
      )
        .populate(
          "actor",
          "name email phone role"
        )
        .populate(
          "targetId",
          "name email phone role status"
        )
        .sort({
          createdAt: -1
        })
        .limit(
          Number(
            req.query.limit
          ) || 200
        );

    res.json({
      count:
        logs.length,
      filters:
        req.query,
      logs
    });

  } catch (error) {

    console.error(
      "Activity logs error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load activity logs"
    });

  }
}

// ======================================================
// ADMIN PROFILE / ROLE SUMMARY
// ======================================================

async function roleSummary(
  req,
  res
) {

  try {

    const summary =
      await User.aggregate([
        {
          $group: {
            _id: "$role",
            total: {
              $sum: 1
            },

            active: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "ACTIVE"
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            pending: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "PENDING"
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            suspended: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "SUSPENDED"
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: {
            total: -1
          }
        }
      ]);

    res.json({
      summary
    });

  } catch (error) {

    console.error(
      "Role summary error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load role summary"
    });

  }
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {

  dashboard,

  listUsers,

  userPortfolio,

  updateUser,

  changeUserStatus,

  changeUserRole,

  shortlistUser,

  shortlistedUsers,

  listOrders,

  listCommissions,

  listWithdrawals,

  listCashTransactions,

  stockOverview,

  listStockTransactions,

  listProducts,

  listCategories,

  networkOverview,

  activityLogs,

  roleSummary

};