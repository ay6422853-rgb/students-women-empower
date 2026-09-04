const User = require("../models/User");
const Order = require("../models/Order");


// ======================================================
// CTO DASHBOARD
// ======================================================

async function dashboard(req, res) {

  try {

    const [
      totalMembers,
      totalTeamLeaders,
      totalSuperTeamLeaders,
      activeMembers,
      activeTeamLeaders,
      activeSuperTeamLeaders
    ] = await Promise.all([

      User.countDocuments({
        role: "MEMBER"
      }),

      User.countDocuments({
        role: "TEAM_LEADER"
      }),

      User.countDocuments({
        role: "SUPER_TEAM_LEADER"
      }),

      User.countDocuments({
        role: "MEMBER",
        status: "ACTIVE"
      }),

      User.countDocuments({
        role: "TEAM_LEADER",
        status: "ACTIVE"
      }),

      User.countDocuments({
        role: "SUPER_TEAM_LEADER",
        status: "ACTIVE"
      })

    ]);


    const [
      totalOrders,
      pendingOrders,
      confirmedOrders
    ] = await Promise.all([

      Order.countDocuments(),

      Order.countDocuments({
        status: "PENDING"
      }),

      Order.countDocuments({
        status: "CONFIRMED"
      })

    ]);


    const salesResult =
      await Order.aggregate([

        {
          $match: {
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

      ]);


    const totalSales =
      salesResult.length
        ? salesResult[0].total
        : 0;


    res.json({

      dashboard: {

        users: {

          totalMembers,

          totalTeamLeaders,

          totalSuperTeamLeaders,

          activeMembers,

          activeTeamLeaders,

          activeSuperTeamLeaders

        },

        orders: {

          totalOrders,

          pendingOrders,

          confirmedOrders

        },

        sales: {

          totalSales

        }

      }

    });

  } catch (error) {

    console.error(
      "CTO dashboard error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load CTO dashboard"

    });

  }

}


// ======================================================
// CTO - MEMBERS
// ======================================================

async function members(req, res) {

  try {

    const users =
      await User.find({

        role: "MEMBER"

      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "teamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          createdAt: -1

        });


    res.json({

      count:
        users.length,

      users

    });

  } catch (error) {

    console.error(
      "CTO members error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load members"

    });

  }

}


// ======================================================
// CTO - TEAM LEADERS
// ======================================================

async function teamLeaders(req, res) {

  try {

    const users =
      await User.find({

        role: "TEAM_LEADER"

      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "superTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          createdAt: -1

        });


    const result = [];


    for (
      const teamLeader
      of users
    ) {

      const assignedMembers =
        await User.find({

          role: "MEMBER",

          teamLeader:
            teamLeader._id

        })

          .select(
            "-password -aadhaarNumber"
          )

          .populate(

            "referredBy",

            "name email phone role referralCode"

          )

          .sort({

            createdAt: -1

          });


      result.push({

        ...teamLeader.toObject(),

        assignedMembers,

        assignedMemberCount:
          assignedMembers.length

      });

    }


    res.json({

      count:
        result.length,

      users:
        result

    });

  } catch (error) {

    console.error(
      "CTO team leaders error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load Team Leaders"

    });

  }

}


// ======================================================
// CTO - SUPER TEAM LEADERS
// ======================================================

async function superTeamLeaders(req, res) {

  try {

    const users =
      await User.find({

        role:
          "SUPER_TEAM_LEADER"

      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "sellingTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          createdAt: -1

        });


    const result = [];


    for (
      const superTeamLeader
      of users
    ) {

      const assignedTeamLeaders =
        await User.find({

          role:
            "TEAM_LEADER",

          superTeamLeader:
            superTeamLeader._id

        })

          .select(
            "-password -aadhaarNumber"
          )

          .populate(

            "superTeamLeader",

            "name email phone address city district state pincode referralCode status role"

          )

          .sort({

            createdAt: -1

          });


      const teamLeadersWithMembers = [];


      for (
        const teamLeader
        of assignedTeamLeaders
      ) {

        const assignedMembers =
          await User.find({

            role:
              "MEMBER",

            teamLeader:
              teamLeader._id

          })

            .select(
              "-password -aadhaarNumber"
            )

            .populate(

              "referredBy",

              "name email phone role referralCode"

            )

            .sort({

              createdAt: -1

            });


        teamLeadersWithMembers.push({

          ...teamLeader.toObject(),

          assignedMembers,

          assignedMemberCount:
            assignedMembers.length

        });

      }


      result.push({

        ...superTeamLeader.toObject(),

        assignedTeamLeaders:
          teamLeadersWithMembers,

        assignedTeamLeaderCount:
          teamLeadersWithMembers.length

      });

    }


    res.json({

      count:
        result.length,

      users:
        result

    });

  } catch (error) {

    console.error(
      "CTO super team leaders error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load Super Team Leaders"

    });

  }

}


// ======================================================
// CTO - NETWORK
// ======================================================

async function network(req, res) {

  try {

    const users =
      await User.find({

        role: {

          $in: [

            "MEMBER",

            "TEAM_LEADER",

            "SUPER_TEAM_LEADER"

          ]

        }

      })

        .select(

          "name email phone city district state role referredBy teamLeader superTeamLeader sellingTeamLeader"

        )

        .populate(

          "referredBy",

          "name role"

        )

        .populate(

          "teamLeader",

          "name role"

        )

        .populate(

          "superTeamLeader",

          "name role"

        )

        .populate(

          "sellingTeamLeader",

          "name role"

        )

        .sort({

          role: 1,

          name: 1

        });


    res.json({

      count:
        users.length,

      users

    });

  } catch (error) {

    console.error(
      "CTO network error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load network"

    });

  }

}


// ======================================================
// CTO - PERFORMANCE
// ======================================================


// ======================================================
// CTO - PERFORMANCE
// ======================================================

async function performance(req, res) {

  try {

    const now = new Date();

    // ==================================================
    // DATE RANGE HELPER
    // ==================================================

    function getPeriodRange(period) {

      let startDate;

      // -----------------------------------------------
      // MONTHLY
      // -----------------------------------------------

      if (period === "monthly") {

        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      }

      // -----------------------------------------------
      // QUARTERLY
      // -----------------------------------------------

      else if (period === "quarterly") {

        const currentQuarter =
          Math.floor(
            now.getMonth() / 3
          );

        startDate = new Date(
          now.getFullYear(),
          currentQuarter * 3,
          1,
          0,
          0,
          0,
          0
        );

      }

      // -----------------------------------------------
      // HALF YEARLY
      // -----------------------------------------------

      else if (period === "half-yearly") {

        const currentMonth =
          now.getMonth();

        const halfStartMonth =
          currentMonth < 6
            ? 0
            : 6;

        startDate = new Date(
          now.getFullYear(),
          halfStartMonth,
          1,
          0,
          0,
          0,
          0
        );

      }

      // -----------------------------------------------
      // YEARLY
      // -----------------------------------------------

      else if (period === "yearly") {

        startDate = new Date(
          now.getFullYear(),
          0,
          1,
          0,
          0,
          0,
          0
        );

      }

      // -----------------------------------------------
      // DEFAULT = MONTHLY
      // -----------------------------------------------

      else {

        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        );

      }

      return {
        startDate,
        endDate: now
      };

    }


    // ==================================================
    // GET PERIOD
    // ==================================================

    const period =
      req.query.period || "monthly";


    const allowedPeriods = [
      "monthly",
      "quarterly",
      "half-yearly",
      "yearly"
    ];


    if (
      !allowedPeriods.includes(
        period
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid performance period"

      });

    }


    // ==================================================
    // DATE RANGE
    // ==================================================

    const {
      startDate,
      endDate
    } =
      getPeriodRange(period);


    // ==================================================
    // ALL ACTIVE PERFORMANCE USERS
    // MEMBER + TEAM LEADER + SUPER TEAM LEADER
    // ==================================================

    const users =
      await User.find({

        role: {

          $in: [

            "MEMBER",

            "TEAM_LEADER",

            "SUPER_TEAM_LEADER"

          ]

        },

        status:
          "ACTIVE"

      })

        .select(

          "name email phone city district state role referralCode status"

        )

        .sort({

          name: 1

        });


    // ==================================================
    // CONFIRMED ORDERS OF SELECTED PERIOD
    // ==================================================

    const orders =
      await Order.find({

        status:
          "CONFIRMED",

        createdAt: {

          $gte:
            startDate,

          $lte:
            endDate

        }

      })

        .select(

          "seller items totalAmount createdAt"

        );


    // ==================================================
    // CREATE PERFORMANCE MAP
    // ==================================================

    const performanceMap = {};


    // ==================================================
    // FIRST ADD EVERY ACTIVE USER
    // ==================================================

    for (
      const user
      of users
    ) {

      const userId =
        String(user._id);


      performanceMap[userId] = {

        userId,

        name:
          user.name || "",

        email:
          user.email || "",

        phone:
          user.phone || "",

        city:
          user.city || "",

        district:
          user.district || "",

        state:
          user.state || "",

        role:
          user.role || "",

        status:
          user.status || "",

        totalOrders:
          0,

        totalQuantity:
          0,

        totalSales:
          0,

        averageOrderValue:
          0

      };

    }


    // ==================================================
    // PROCESS ORDERS
    // ==================================================

    for (
      const order
      of orders
    ) {

      if (!order.seller) {
        continue;
      }


      const sellerId =
        String(
          order.seller
        );


      // -----------------------------------------------
      // Seller system me active performance user nahi
      // -----------------------------------------------

      if (
        !performanceMap[sellerId]
      ) {
        continue;
      }


      const seller =
        performanceMap[sellerId];


      // -----------------------------------------------
      // ORDERS
      // -----------------------------------------------

      seller.totalOrders += 1;


      // -----------------------------------------------
      // SALES
      // -----------------------------------------------

      seller.totalSales +=
        Number(
          order.totalAmount || 0
        );


      // -----------------------------------------------
      // PRODUCTS
      // -----------------------------------------------

      for (
        const item
        of order.items || []
      ) {

        seller.totalQuantity +=
          Number(
            item.quantity || 0
          );

      }

    }


    // ==================================================
    // FINAL PERFORMANCE LIST
    // ==================================================

    let performance =
      Object.values(
        performanceMap
      );


    // ==================================================
    // AVERAGE ORDER VALUE
    // ==================================================

    performance =
      performance.map(
        (user) => {

          user.averageOrderValue =
            user.totalOrders > 0
              ? Number(
                  (
                    user.totalSales /
                    user.totalOrders
                  ).toFixed(2)
                )
              : 0;

          return user;

        }
      );


    // ==================================================
    // SORT BY SALES
    // HIGH TO LOW
    // ==================================================

    performance.sort(
      (a, b) => {

        if (
          b.totalSales !==
          a.totalSales
        ) {

          return (
            b.totalSales -
            a.totalSales
          );

        }

        if (
          b.totalOrders !==
          a.totalOrders
        ) {

          return (
            b.totalOrders -
            a.totalOrders
          );

        }

        return String(
          a.name || ""
        ).localeCompare(
          String(
            b.name || ""
          )
        );

      }
    );


    // ==================================================
    // ADD RANK
    // ==================================================

    performance =
      performance.map(
        (user, index) => ({

          ...user,

          rank:
            index + 1

        })
      );


    // ==================================================
    // ONLY USERS WHO ACTUALLY PERFORMED
    // ==================================================

    const performers =
      performance
        .filter(
          (user) =>
            Number(
              user.totalSales || 0
            ) > 0
        );


    // ==================================================
    // TOP PERFORMERS
    // ==================================================

    const topPerformers =
      performers
        .slice(
          0,
          5
        );


    // ==================================================
    // LOW PERFORMERS
    // ==================================================

    const lowPerformers =
      [...performers]
        .sort(
          (a, b) =>
            a.totalSales -
            b.totalSales
        )
        .slice(
          0,
          5
        );


    // ==================================================
    // SUMMARY
    // ==================================================

    const totalSales =
      performance.reduce(
        (sum, user) =>
          sum +
          Number(
            user.totalSales || 0
          ),
        0
      );


    const totalOrders =
      performance.reduce(
        (sum, user) =>
          sum +
          Number(
            user.totalOrders || 0
          ),
        0
      );


    const totalQuantity =
      performance.reduce(
        (sum, user) =>
          sum +
          Number(
            user.totalQuantity || 0
          ),
        0
      );


    const activePerformers =
      performers.length;


    const totalUsers =
      performance.length;


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

      success: true,

      period,

      startDate,

      endDate,

      summary: {

        totalUsers,

        activePerformers,

        totalOrders,

        totalQuantity,

        totalSales

      },

      // =================================================
      // TOP PERFORMERS
      // =================================================

      topPerformers,

      // =================================================
      // LOW PERFORMERS
      // =================================================

      lowPerformers,

      // =================================================
      // COMPLETE PERFORMANCE LIST
      // =================================================

      performance

    });

  } catch (error) {

    console.error(
      "CTO performance error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Unable to load performance",

      error:
        error.message

    });

  }

}


// ======================================================
// CTO - CHANGE ROLE
// ======================================================

async function changeRole(req, res) {

  try {

    const allowedRoles = [

      "MEMBER",

      "TEAM_LEADER",

      "SUPER_TEAM_LEADER"

    ];


    const {
      role
    } = req.body;


    if (
      !allowedRoles.includes(role)
    ) {

      return res.status(400).json({

        message:
          "CTO can only assign MEMBER, TEAM_LEADER or SUPER_TEAM_LEADER"

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


    user.role =
      role;


    // MEMBER

    if (
      role === "MEMBER"
    ) {

      user.superTeamLeader =
        null;

      user.sellingTeamLeader =
        null;

    }


    // TEAM LEADER

    if (
      role === "TEAM_LEADER"
    ) {

      user.sellingTeamLeader =
        null;

    }


    // SUPER TEAM LEADER

    if (
      role === "SUPER_TEAM_LEADER"
    ) {

      user.teamLeader =
        null;

    }


    await user.save();


    const updatedUser =
      await User.findById(
        user._id
      )

        .select(
          "-password -aadhaarNumber"
        )

        .populate(
          "teamLeader",
          "name email phone city district state pincode referralCode status role"
        )

        .populate(
          "superTeamLeader",
          "name email phone city district state pincode referralCode status role"
        )

        .populate(
          "sellingTeamLeader",
          "name email phone city district state pincode referralCode status role"
        );


    res.json({

      message:
        "Role updated successfully",

      user:
        updatedUser

    });

  } catch (error) {

    console.error(
      "CTO role change error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to change role"

    });

  }

}


// ======================================================
// CTO - ASSIGN MEMBER TO TEAM LEADER
// ======================================================

async function assignMember(req, res) {

  try {

    const {
      teamLeaderId
    } = req.body;


    if (!teamLeaderId) {

      return res.status(400).json({

        message:
          "Team Leader ID is required"

      });

    }


    const member =
      await User.findById(
        req.params.id
      );


    if (!member) {

      return res.status(404).json({

        message:
          "Member not found"

      });

    }


    if (
      member.role !==
      "MEMBER"
    ) {

      return res.status(400).json({

        message:
          "Selected user is not a MEMBER"

      });

    }


    const teamLeader =
      await User.findOne({

        _id:
          teamLeaderId,

        role:
          "TEAM_LEADER",

        status:
          "ACTIVE"

      });


    if (!teamLeader) {

      return res.status(400).json({

        message:
          "Active Team Leader not found"

      });

    }


    member.teamLeader =
      teamLeader._id;


    await member.save();


    const updatedMember =
      await User.findById(
        member._id
      )

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "teamLeader",

          "name email phone address city district state pincode referralCode status role"

        );


    res.json({

      message:
        "Member assigned to Team Leader successfully",

      member:
        updatedMember

    });

  } catch (error) {

    console.error(
      "Assign member error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to assign Member"

    });

  }

}


// ======================================================
// CTO - BULK ASSIGN MEMBERS
// ======================================================

async function bulkAssignMembers(req, res) {

  try {

    const {
      memberIds,
      teamLeaderId
    } = req.body;


    if (
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {

      return res.status(400).json({

        message:
          "Please select at least one Member"

      });

    }


    if (!teamLeaderId) {

      return res.status(400).json({

        message:
          "Team Leader ID is required"

      });

    }


    const uniqueMemberIds = [

      ...new Set(

        memberIds.map(
          id => String(id)
        )

      )

    ];


    const teamLeader =
      await User.findOne({

        _id:
          teamLeaderId,

        role:
          "TEAM_LEADER",

        status:
          "ACTIVE"

      });


    if (!teamLeader) {

      return res.status(400).json({

        message:
          "Active Team Leader not found"

      });

    }


    const members =
      await User.find({

        _id: {

          $in:
            uniqueMemberIds

        },

        role:
          "MEMBER"

      });


    if (
      members.length !==
      uniqueMemberIds.length
    ) {

      return res.status(400).json({

        message:
          "One or more selected users are not valid Members"

      });

    }


    const alreadyAssigned =
      members.filter(

        member =>
          member.teamLeader

      );


    if (
      alreadyAssigned.length > 0
    ) {

      return res.status(400).json({

        message:
          "Some selected Members are already assigned to a Team Leader"

      });

    }


    const result =
      await User.updateMany(

        {

          _id: {

            $in:
              uniqueMemberIds

          },

          role:
            "MEMBER",

          $or: [

            {
              teamLeader:
                null
            },

            {
              teamLeader: {
                $exists:
                  false
              }
            }

          ]

        },

        {

          $set: {

            teamLeader:
              teamLeader._id

          }

        }

      );


    res.json({

      message:
        `${result.modifiedCount} Members assigned to Team Leader successfully`,

      assignedCount:
        result.modifiedCount,

      teamLeader: {

        id:
          teamLeader._id,

        name:
          teamLeader.name,

        email:
          teamLeader.email,

        phone:
          teamLeader.phone

      }

    });

  } catch (error) {

    console.error(
      "Bulk assign members error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to bulk assign Members"

    });

  }

}


// ======================================================
// CTO - ASSIGN TEAM LEADER TO SUPER TEAM LEADER
// ======================================================

async function assignTeamLeader(req, res) {

  try {

    const {
      superTeamLeaderId
    } = req.body;


    if (!superTeamLeaderId) {

      return res.status(400).json({

        message:
          "Super Team Leader ID is required"

      });

    }


    const teamLeader =
      await User.findById(
        req.params.id
      );


    if (!teamLeader) {

      return res.status(404).json({

        message:
          "Team Leader not found"

      });

    }


    if (
      teamLeader.role !==
      "TEAM_LEADER"
    ) {

      return res.status(400).json({

        message:
          "Selected user is not a TEAM_LEADER"

      });

    }


    const stl =
      await User.findOne({

        _id:
          superTeamLeaderId,

        role:
          "SUPER_TEAM_LEADER",

        status:
          "ACTIVE"

      });


    if (!stl) {

      return res.status(400).json({

        message:
          "Active Super Team Leader not found"

      });

    }


    teamLeader.superTeamLeader =
      stl._id;


    await teamLeader.save();


    const updatedTeamLeader =
      await User.findById(
        teamLeader._id
      )

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "superTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        );


    res.json({

      message:
        "Team Leader assigned successfully",

      teamLeader:
        updatedTeamLeader

    });

  } catch (error) {

    console.error(
      "Assign Team Leader error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to assign Team Leader"

    });

  }

}


// ======================================================
// CTO - BULK ASSIGN TEAM LEADERS
// ======================================================

async function bulkAssignTeamLeaders(req, res) {

  try {

    const {
      teamLeaderIds,
      superTeamLeaderId
    } = req.body;


    if (
      !Array.isArray(teamLeaderIds) ||
      teamLeaderIds.length === 0
    ) {

      return res.status(400).json({

        message:
          "Please select at least one Team Leader"

      });

    }


    if (!superTeamLeaderId) {

      return res.status(400).json({

        message:
          "Super Team Leader ID is required"

      });

    }


    const uniqueTeamLeaderIds = [

      ...new Set(

        teamLeaderIds.map(
          id => String(id)
        )

      )

    ];


    const superTeamLeader =
      await User.findOne({

        _id:
          superTeamLeaderId,

        role:
          "SUPER_TEAM_LEADER",

        status:
          "ACTIVE"

      });


    if (!superTeamLeader) {

      return res.status(400).json({

        message:
          "Active Super Team Leader not found"

      });

    }


    const teamLeaders =
      await User.find({

        _id: {

          $in:
            uniqueTeamLeaderIds

        },

        role:
          "TEAM_LEADER"

      });


    if (
      teamLeaders.length !==
      uniqueTeamLeaderIds.length
    ) {

      return res.status(400).json({

        message:
          "One or more selected users are not valid Team Leaders"

      });

    }


    const alreadyAssigned =
      teamLeaders.filter(

        leader =>
          leader.superTeamLeader

      );


    if (
      alreadyAssigned.length > 0
    ) {

      return res.status(400).json({

        message:
          "Some selected Team Leaders are already assigned to a Super Team Leader"

      });

    }


    const result =
      await User.updateMany(

        {

          _id: {

            $in:
              uniqueTeamLeaderIds

          },

          role:
            "TEAM_LEADER",

          $or: [

            {
              superTeamLeader:
                null
            },

            {
              superTeamLeader: {

                $exists:
                  false

              }

            }

          ]

        },

        {

          $set: {

            superTeamLeader:
              superTeamLeader._id

          }

        }

      );


    res.json({

      message:
        `${result.modifiedCount} Team Leaders assigned to Super Team Leader successfully`,

      assignedCount:
        result.modifiedCount,

      superTeamLeader: {

        id:
          superTeamLeader._id,

        name:
          superTeamLeader.name,

        email:
          superTeamLeader.email,

        phone:
          superTeamLeader.phone

      }

    });

  } catch (error) {

    console.error(
      "Bulk assign Team Leaders error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to bulk assign Team Leaders"

    });

  }

}


// ======================================================
// CTO - ASSIGN SELLING TEAM LEADER
// ======================================================

async function assignSellingTeamLeader(req, res) {

  try {

    const {
      teamLeaderId
    } = req.body;


    if (!teamLeaderId) {

      return res.status(400).json({

        message:
          "Team Leader ID is required"

      });

    }


    const stl =
      await User.findById(
        req.params.id
      );


    if (!stl) {

      return res.status(404).json({

        message:
          "Super Team Leader not found"

      });

    }


    if (
      stl.role !==
      "SUPER_TEAM_LEADER"
    ) {

      return res.status(400).json({

        message:
          "Selected user is not a SUPER_TEAM_LEADER"

      });

    }


    const teamLeader =
      await User.findOne({

        _id:
          teamLeaderId,

        role:
          "TEAM_LEADER",

        status:
          "ACTIVE"

      });


    if (!teamLeader) {

      return res.status(400).json({

        message:
          "Active Team Leader not found"

      });

    }


    stl.sellingTeamLeader =
      teamLeader._id;


    await stl.save();


    const updatedSTL =
      await User.findById(
        stl._id
      )

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "sellingTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        );


    res.json({

      message:
        "Selling Team Leader assigned successfully",

      superTeamLeader:
        updatedSTL

    });

  } catch (error) {

    console.error(
      "Assign selling Team Leader error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to assign Selling Team Leader"

    });

  }

}


// ======================================================
// CTO - SALES
// ======================================================

async function sales(req, res) {
  try {
    const now = new Date();

    // =====================================================
    // WEEK START - MONDAY
    // =====================================================

    const weekStart = new Date(now);

    const day = weekStart.getDay();

    const diff = day === 0 ? 6 : day - 1;

    weekStart.setDate(
      weekStart.getDate() - diff
    );

    weekStart.setHours(
      0,
      0,
      0,
      0
    );

    // =====================================================
    // MONTH START
    // =====================================================

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    // =====================================================
    // ACTIVE MEMBERS
    // =====================================================

    const members = await User.find({
      role: {
         $in: [
          "MEMBER", 
          "TEAM_LEADER", 
          "SUPER_TEAM_LEADER" 
        ] 
      },

      status: "ACTIVE"
    })
      .select(
        "-password -aadhaarNumber"
      )
      .populate(
        "teamLeader",
        "name email phone"
      )
      .sort({
        name: 1
      });

    // =====================================================
    // ALL CONFIRMED ORDERS
    // =====================================================

    const orders = await Order.find({
      status: "CONFIRMED"
    })
      .populate(
        "buyer",
        "name email phone address city district state pincode role referralCode"
      )
      .populate(
        "seller",
        "name email phone address city district state pincode role referralCode"
      )
      .populate(
        "items.product",
        "name price category"
      )
      .sort({
        createdAt: -1
      });

    // =====================================================
    // CREATE USER PURCHASE LIST
    // =====================================================

    function createUserPurchaseList(orderList) {
      const purchaseMap = {};

      // ===================================================
      // FIRST CREATE EVERY ACTIVE MEMBER
      // ===================================================

      for (const member of members) {
        const userId = String(member._id);

        purchaseMap[userId] = {
          userId,

          name: member.name || "",

          email: member.email || "",

          phone: member.phone || "",

          address: member.address || "",

          city: member.city || "",

          district: member.district || "",

          state: member.state || "",

          pincode: member.pincode || "",

          role: member.role,

          teamLeader: member.teamLeader || null,

          purchaseStatus: "NOT PURCHASED",

          totalOrders: 0,

          totalQuantity: 0,

          totalPurchase: 0,

          orders: []
        };
      }

      // ===================================================
      // ADD PURCHASE DATA
      // ===================================================

      for (const order of orderList) {
        if (!order.buyer) {
          continue;
        }

        const userId = String(
          order.buyer._id
        );

        // Buyer active member list me nahi hai
        if (!purchaseMap[userId]) {
          continue;
        }

        const user = purchaseMap[userId];

        user.purchaseStatus =
          "PURCHASED";

        user.totalOrders += 1;

        user.totalPurchase += Number(
          order.totalAmount || 0
        );

        // =================================================
        // ORDER ITEMS
        // =================================================

        let orderQuantity = 0;

        const orderItems = (
          order.items || []
        ).map((item) => {
          const quantity = Number(
            item.quantity || 0
          );

          const price = Number(
            item.price || 0
          );

          orderQuantity += quantity;

          user.totalQuantity += quantity;

          return {
            productId:
              item.product?._id || null,

            productName:
              item.product?.name ||
              "Unknown Product",

            category:
              item.product?.category ||
              null,

            quantity,

            price,

            amount:
              quantity * price
          };
        });

        // =================================================
        // ORDER DETAILS
        // =================================================

        user.orders.push({
          orderId:
            order._id,

          totalAmount:
            Number(
              order.totalAmount || 0
            ),

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          status:
            order.status,

          seller:
            order.seller || null,

          createdAt:
            order.createdAt,

          quantity:
            orderQuantity,

          items:
            orderItems
        });
      }

      // ===================================================
      // LOWEST PURCHASE FIRST
      // ₹0 FIRST
      // ===================================================

      return Object.values(
        purchaseMap
      ).sort((a, b) => {
        return (
          Number(a.totalPurchase || 0) -
          Number(b.totalPurchase || 0)
        );
      });
    }

    // =====================================================
    // WEEKLY ORDERS
    // =====================================================

    const weeklyOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >=
        weekStart
    );

    // =====================================================
    // MONTHLY ORDERS
    // =====================================================

    const monthlyOrders = orders.filter(
      (order) =>
        new Date(order.createdAt) >=
        monthStart
    );

    // =====================================================
    // SUMMARY
    // =====================================================

    function calculateSummary(orderList) {
      let totalSales = 0;

      let totalQuantity = 0;

      const products = {};

      const sellers = {};

      // ===================================================
      // PROCESS ORDERS
      // ===================================================

      for (const order of orderList) {
        totalSales += Number(
          order.totalAmount || 0
        );

        // =================================================
        // SELLER
        // =================================================

        if (order.seller) {
          const sellerId = String(
            order.seller._id
          );

          if (!sellers[sellerId]) {
            sellers[sellerId] = {
              sellerId,

              name:
                order.seller.name ||
                "Unknown",

              email:
                order.seller.email ||
                "",

              phone:
                order.seller.phone ||
                "",

              role:
                order.seller.role ||
                "",

              totalOrders: 0,

              totalQuantity: 0,

              totalSales: 0
            };
          }

          sellers[sellerId]
            .totalOrders += 1;

          sellers[sellerId]
            .totalSales += Number(
              order.totalAmount || 0
            );
        }

        // =================================================
        // PRODUCTS
        // =================================================

        for (const item of order.items || []) {
          const quantity = Number(
            item.quantity || 0
          );

          const price = Number(
            item.price || 0
          );

          totalQuantity += quantity;

          // ===============================================
          // SELLER QUANTITY
          // ===============================================

          if (order.seller) {
            const sellerId = String(
              order.seller._id
            );

            if (sellers[sellerId]) {
              sellers[sellerId]
                .totalQuantity += quantity;
            }
          }

          // ===============================================
          // PRODUCT
          // ===============================================

          if (item.product) {
            const productId = String(
              item.product._id
            );

            if (!products[productId]) {
              products[productId] = {
                productId,

                productName:
                  item.product.name ||
                  "Unknown Product",

                category:
                  item.product.category ||
                  null,

                quantity: 0,

                sales: 0
              };
            }

            products[productId]
              .quantity += quantity;

            products[productId]
              .sales +=
              quantity * price;
          }
        }
      }

      // ===================================================
      // ALL MEMBERS
      // ===================================================

      const users =
        createUserPurchaseList(
          orderList
        );

      // ===================================================
      // FINAL SUMMARY
      // ===================================================

      return {
        totalOrders:
          orderList.length,

        totalQuantity,

        totalSales,

        users,

        products:
          Object.values(products).sort(
            (a, b) =>
              b.sales - a.sales
          ),

        sellers:
          Object.values(sellers).sort(
            (a, b) =>
              b.totalSales -
              a.totalSales
          )
      };
    }

    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    res.json({
      success: true,

      weekly: {
        startDate:
          weekStart,

        endDate:
          now,

        ...calculateSummary(
          weeklyOrders
        )
      },

      monthly: {
        startDate:
          monthStart,

        endDate:
          now,

        ...calculateSummary(
          monthlyOrders
        )
      },

      // =================================================
      // ALL CONFIRMED ORDERS
      // =================================================

      orders: orders.map(
        (order) => ({
          _id:
            order._id,

          buyer:
            order.buyer,

          seller:
            order.seller,

          items:
            order.items,

          totalAmount:
            order.totalAmount,

          status:
            order.status,

          paymentStatus:
            order.paymentStatus,

          paymentMethod:
            order.paymentMethod,

          createdAt:
            order.createdAt
        })
      )
    });

  } catch (error) {
    console.error(
      "CTO sales error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Unable to load sales",

      error:
        error.message
    });
  }
}


async function teamBuilding(req, res) {

  try {

    // ==================================================
    // UNASSIGNED MEMBERS
    // ==================================================

    const unassignedMembers =
      await User.find({

        role:
          "MEMBER",

        $or: [

          {
            teamLeader:
              null
          },

          {
            teamLeader: {

              $exists:
                false

            }

          }

        ]

      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "referredBy",

          "name email phone role referralCode"

        )

        .populate(

          "teamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          createdAt:
            -1

        });


    // ==================================================
    // UNASSIGNED TEAM LEADERS
    // ==================================================

    const unassignedTeamLeaders =
      await User.find({

        role:
          "TEAM_LEADER",

        $or: [

          {
            superTeamLeader:
              null
          },

          {
            superTeamLeader: {

              $exists:
                false

            }

          }

        ]

      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(

          "referredBy",

          "name email phone role referralCode"

        )

        .populate(

          "superTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          createdAt:
            -1

        });


    // ==================================================
    // ACTIVE TEAM LEADERS
    // ==================================================

    const teamLeaders =
      await User.find({

        role:
          "TEAM_LEADER",

        status:
          "ACTIVE"

      })

        .select(

          "name email phone address city district state pincode referralCode status role superTeamLeader"

        )

        .populate(

          "superTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          name:
            1

        });


    const teamLeadersWithCounts = [];


    for (
      const teamLeader
      of teamLeaders
    ) {

      const assignedMemberCount =
        await User.countDocuments({

          role:
            "MEMBER",

          teamLeader:
            teamLeader._id

        });


      teamLeadersWithCounts.push({

        ...teamLeader.toObject(),

        assignedMemberCount

      });

    }


    // ==================================================
    // ACTIVE SUPER TEAM LEADERS
    // ==================================================

    const superTeamLeaders =
      await User.find({

        role:
          "SUPER_TEAM_LEADER",

        status:
          "ACTIVE"

      })

        .select(

          "name email phone address city district state pincode referralCode status role sellingTeamLeader"

        )

        .populate(

          "sellingTeamLeader",

          "name email phone address city district state pincode referralCode status role"

        )

        .sort({

          name:
            1

        });


    const superTeamLeadersWithCounts = [];


    for (
      const stl
      of superTeamLeaders
    ) {

      const assignedTeamLeaderCount =
        await User.countDocuments({

          role:
            "TEAM_LEADER",

          superTeamLeader:
            stl._id

        });


      superTeamLeadersWithCounts.push({

        ...stl.toObject(),

        assignedTeamLeaderCount

      });

    }


    // ==================================================
    // COUNTS
    // ==================================================

    const [

      totalMembers,

      totalTeamLeaders,

      totalSuperTeamLeaders

    ] = await Promise.all([

      User.countDocuments({

        role:
          "MEMBER"

      }),

      User.countDocuments({

        role:
          "TEAM_LEADER"

      }),

      User.countDocuments({

        role:
          "SUPER_TEAM_LEADER"

      })

    ]);


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

      summary: {

        totalMembers,

        totalTeamLeaders,

        totalSuperTeamLeaders,

        unassignedMembers:
          unassignedMembers.length,

        unassignedTeamLeaders:
          unassignedTeamLeaders.length

      },

      unassignedMembers,

      unassignedTeamLeaders,

      teamLeaders:
        teamLeadersWithCounts,

      superTeamLeaders:
        superTeamLeadersWithCounts

    });

  } catch (error) {

    console.error(
      "CTO team building error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load team building data"

    });

  }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  dashboard,
  members,
  teamLeaders,
  superTeamLeaders,
  network,
  performance,
  changeRole,
  assignMember,
  bulkAssignMembers,
  assignTeamLeader,
  bulkAssignTeamLeaders,
  assignSellingTeamLeader,
  sales,
  teamBuilding
};