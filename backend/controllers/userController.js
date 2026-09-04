const User = require("../models/User");
const Order = require("../models/Order");

const {
  publicUser
} = require("./authController");


// ==========================================
// GET CURRENT USER
// ==========================================

async function me(req, res) {

  try {

    const user =
      await User.findById(req.user.id);

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    res.json({
      user: publicUser(user)
    });

  } catch (error) {

    console.error("Me error:", error);

    res.status(500).json({
      message: "Unable to load user"
    });

  }
}


// ==========================================
// ADMIN - LIST USERS
// ==========================================

async function listUsers(req, res) {

  try {

    const filter = {};

    for (const key of [
      "role",
      "status",
      "state",
      "district",
      "city",
      "pincode"
    ]) {

      if (req.query[key]) {
        filter[key] = req.query[key];
      }

    }

    const users =
      await User.find(filter)

        .select("-password -aadhaarNumber")

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

        .populate(
          "distributor",
          "name email phone role"
        )

        .sort({
          createdAt: -1
        });


    const result = [];

    for (const user of users) {

      const directReferrals =
        await User.countDocuments({
          referredBy: user._id
        });

      result.push({

        ...user.toObject(),

        directReferrals

      });

    }

    res.json({
      users: result
    });

  } catch (error) {

    console.error(
      "List users error:",
      error
    );

    res.status(500).json({
      message: "Unable to load users"
    });

  }
}


// ==========================================
// ADMIN - USER REFERRALS
// ==========================================

async function referrals(req, res) {

  try {

    const userId =
      req.params.id;

    const direct =
      await User.find({
        referredBy: userId
      })

        .select("-password -aadhaarNumber")

        .sort({
          createdAt: -1
        });


    res.json({
      directReferrals: direct
    });

  } catch (error) {

    console.error(
      "Referrals error:",
      error
    );

    res.status(500).json({
      message: "Unable to load referrals"
    });

  }
}


// ==========================================
// CURRENT USER - MY REFERRALS
// ==========================================

async function myReferrals(req, res) {

  try {

    const userId =
      req.user.id;

    const period =
      req.query.period || "monthly";

    const now =
      new Date();

    let startDate;


    if (period === "weekly") {

      startDate =
        new Date(now);

      startDate.setDate(
        now.getDate() - 7
      );

    } else {

      startDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

    }


    const directReferrals =
      await User.find({
        referredBy: userId
      })

        .select("-password -aadhaarNumber")

        .sort({
          createdAt: -1
        });


    const result = [];


    for (
      const user
      of directReferrals
    ) {

      const orders =
        await Order.find({

          buyer: user._id,

          status: "CONFIRMED",

          createdAt: {
            $gte: startDate,
            $lte: now
          }

        }).select(
          "totalAmount createdAt"
        );


      const totalPurchase =
        orders.reduce(
          (total, order) =>
            total +
            Number(
              order.totalAmount || 0
            ),
          0
        );


      result.push({

        ...user.toObject(),

        totalPurchase,

        orderCount:
          orders.length,

        hasPurchased:
          orders.length > 0

      });

    }


    res.json({

      period,

      startDate,

      endDate: now,

      directReferrals:
        result

    });

  } catch (error) {

    console.error(
      "My referrals error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load referrals"
    });

  }
}


// ==========================================
// TEAM LEADER - MY NETWORK
// ==========================================


// ==========================================
// TEAM LEADER - MY NETWORK
// ==========================================
// Returns two separate lists:
// 1. referrals       -> members referred by this Team Leader
// 2. approvedMembers -> members assigned/approved by CTO
// ==========================================

async function myNetwork(req, res) {

  try {

    // ========================================
    // ONLY TEAM LEADER
    // ========================================

    if (req.user.role !== "TEAM_LEADER") {

      return res.status(403).json({
        message:
          "Only Team Leader can access this network"
      });

    }


    const teamLeaderId = req.user.id;


    // ========================================
    // 1. MY REFERRALS
    // ========================================
    // These members registered through
    // this Team Leader's referral.
    //
    // IMPORTANT:
    // Do NOT remove this because commission
    // calculation can use referredBy.
    // ========================================

    const referrals =
      await User.find({

        referredBy:
          teamLeaderId,

        role:
          "MEMBER"

      })

        .select(
          "-password -aadhaarNumber"
        )

        .sort({
          createdAt: -1
        });


    // ========================================
    // 2. CTO APPROVED / ASSIGNED MEMBERS
    // ========================================
    // These members were assigned to this
    // Team Leader by CTO.
    //
    // teamLeader field is set by assignTeam()
    // ========================================

    const approvedMembers =
      await User.find({

        teamLeader:
          teamLeaderId,

        role:
          "MEMBER",

        status:
          "ACTIVE"

      })

        .select(
          "-password -aadhaarNumber"
        )

        .sort({
          createdAt: -1
        });


    // ========================================
    // RESPONSE
    // ========================================

    res.json({

      referrals: {

        count:
          referrals.length,

        members:
          referrals

      },

      approvedMembers: {

        count:
          approvedMembers.length,

        members:
          approvedMembers

      }

    });


  } catch (error) {

    console.error(
      "Team Leader network error:",
      error
    );


    res.status(500).json({

      message:
        "Unable to load Team Leader network"

    });

  }

}



// ==========================================
// GET ACTIVE TEAM LEADERS
// ==========================================

async function listTeamLeaders(req, res) {

  try {

    const users =
      await User.find({

        role:
          "TEAM_LEADER",

        status:
          "ACTIVE"

      })

        .select(
          "name email phone city district state pincode referralCode"
        )

        .sort({
          name: 1
        });


    res.json({
      users
    });

  } catch (error) {

    console.error(
      "Team leaders error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load Team Leaders"
    });

  }
}


// ==========================================
// DISTRIBUTION MANAGER - SUPER TEAM LEADERS
// ==========================================

async function distributionManagerSuperTeamLeaders(req, res) {

  try {

    const leaders =
      await User.find({

        role: "SUPER_TEAM_LEADER",

        status: "ACTIVE"

      })

        .select(
          "name email phone city district state pincode referralCode role status"
        )

        .sort({
          name: 1
        });


    res.json({

      count:
        leaders.length,

      users:
        leaders

    });

  } catch (error) {

    console.error(
      "Distribution Manager Super Team Leaders error:",
      error
    );

    res.status(500).json({

      message:
        "Unable to load Super Team Leaders"

    });

  }

}


// ======================================================
// CTO - MEMBERS
// ======================================================

async function ctoMembers(req, res) {

  try {

    const members =
      await User.find({
        role: "MEMBER"
      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(
          "teamLeader",
          "name email phone role"
        )

        .populate(
          "sellingTeamLeader",
          "name email phone role"
        )

        .sort({
          createdAt: -1
        });


    res.json({

      count:
        members.length,

      users:
        members

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

async function ctoTeamLeaders(req, res) {

  try {

    const leaders =
      await User.find({
        role: "TEAM_LEADER"
      })

        .select(
          "-password -aadhaarNumber"
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


    res.json({

      count:
        leaders.length,

      users:
        leaders

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

async function ctoSuperTeamLeaders(req, res) {

  try {

    const leaders =
      await User.find({
        role:
          "SUPER_TEAM_LEADER"
      })

        .select(
          "-password -aadhaarNumber"
        )

        .populate(
          "sellingTeamLeader",
          "name email phone role"
        )

        .populate(
          "distributor",
          "name email phone role"
        )

        .sort({
          createdAt: -1
        });


    res.json({

      count:
        leaders.length,

      users:
        leaders

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
// CTO - ASSIGN TEAM
// ======================================================

async function assignTeam(req, res) {

  try {

    const userId =
      req.params.id;

    const {
      teamLeader,
      superTeamLeader,
      sellingTeamLeader,
      distributor
    } = req.body;


    const user =
      await User.findById(
        userId
      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found"
      });

    }


    // ==========================================
    // MEMBER
    // ==========================================

    if (
      user.role ===
      "MEMBER"
    ) {

      if (
        teamLeader !== undefined
      ) {

        if (teamLeader) {

          const leader =
            await User.findOne({
              _id: teamLeader,
              role: "TEAM_LEADER"
            });

          if (!leader) {

            return res.status(400).json({
              message:
                "Invalid Team Leader"
            });

          }

        }

        user.teamLeader =
          teamLeader || null;

      }


      if (
        sellingTeamLeader !==
        undefined
      ) {

        if (sellingTeamLeader) {

          const leader =
            await User.findOne({
              _id:
                sellingTeamLeader,
              role:
                "TEAM_LEADER"
            });

          if (!leader) {

            return res.status(400).json({
              message:
                "Invalid Selling Team Leader"
            });

          }

        }

        user.sellingTeamLeader =
          sellingTeamLeader || null;

      }

    }


    // ==========================================
    // TEAM LEADER
    // ==========================================

    else if (
      user.role ===
      "TEAM_LEADER"
    ) {

      if (
        superTeamLeader !==
        undefined
      ) {

        if (superTeamLeader) {

          const superLeader =
            await User.findOne({

              _id:
                superTeamLeader,

              role:
                "SUPER_TEAM_LEADER"

            });

          if (!superLeader) {

            return res.status(400).json({
              message:
                "Invalid Super Team Leader"
            });

          }

        }

        user.superTeamLeader =
          superTeamLeader || null;

      }


      if (
        sellingTeamLeader !==
        undefined
      ) {

        if (sellingTeamLeader) {

          const leader =
            await User.findOne({

              _id:
                sellingTeamLeader,

              role:
                "TEAM_LEADER"

            });

          if (!leader) {

            return res.status(400).json({
              message:
                "Invalid Selling Team Leader"
            });

          }

        }

        user.sellingTeamLeader =
          sellingTeamLeader || null;

      }

    }


    // ==========================================
    // SUPER TEAM LEADER
    // ==========================================

    else if (
      user.role ===
      "SUPER_TEAM_LEADER"
    ) {

      if (
        sellingTeamLeader !==
        undefined
      ) {

        if (sellingTeamLeader) {

          const leader =
            await User.findOne({

              _id:
                sellingTeamLeader,

              role:
                "TEAM_LEADER"

            });

          if (!leader) {

            return res.status(400).json({
              message:
                "Invalid Selling Team Leader"
            });

          }

        }

        user.sellingTeamLeader =
          sellingTeamLeader || null;

      }


      if (
        distributor !==
        undefined
      ) {

        if (distributor) {

          const distributorUser =
            await User.findOne({

              _id:
                distributor,

              role:
                "DISTRIBUTION_MANAGER"

            });

          if (!distributorUser) {

            return res.status(400).json({
              message:
                "Invalid Distributor"
            });

          }

        }

        user.distributor =
          distributor || null;

      }

    }


    else {

      return res.status(400).json({
        message:
          "CTO can only manage Member, Team Leader and Super Team Leader"
      });

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

        .populate(
          "distributor",
          "name email phone role"
        );


    res.json({

      message:
        "Team assignment updated",

      user:
        updatedUser

    });

  } catch (error) {

    console.error(
      "Assign team error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update team assignment"
    });

  }
}


// ======================================================
// CTO - CHANGE ROLE
// ======================================================

async function ctoChangeRole(req, res) {

  try {

    const allowedRoles = [

      "MEMBER",

      "TEAM_LEADER",

      "SUPER_TEAM_LEADER"

    ];


    const newRole =
      req.body.role;


    if (
      !allowedRoles.includes(
        newRole
      )
    ) {

      return res.status(400).json({
        message:
          "CTO can only assign MEMBER, TEAM_LEADER or SUPER_TEAM_LEADER role"
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


    // CTO cannot change higher roles
    const manageableRoles = [

      "MEMBER",

      "TEAM_LEADER",

      "SUPER_TEAM_LEADER"

    ];


    if (
      !manageableRoles.includes(
        user.role
      )
    ) {

      return res.status(403).json({
        message:
          "CTO cannot change this user's role"
      });

    }


    user.role =
      newRole;


    await user.save();


    res.json({

      message:
        "Role updated successfully",

      user:
        publicUser(user)

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


// ==========================================
// ADMIN - CHANGE USER ROLE
// ==========================================

async function changeRole(req, res) {

  try {

    const allowed = [

      "MEMBER",

      "TEAM_LEADER",

      "SUPER_TEAM_LEADER",

      "CHIEF_TEAM_OFFICER",

      "PRODUCT_MANAGER",

      "CASH_MANAGER",

      "DISTRIBUTION_MANAGER",

      "ADMIN"

    ];


    if (
      !allowed.includes(
        req.body.role
      )
    ) {

      return res.status(400).json({
        message:
          "Invalid role"
      });

    }


    const user =
      await User.findByIdAndUpdate(

        req.params.id,

        {
          role:
            req.body.role
        },

        {
          new: true
        }

      );


    if (!user) {

      return res.status(404).json({
        message:
          "User not found"
      });

    }


    res.json({

      message:
        "Role updated",

      user:
        publicUser(user)

    });

  } catch (error) {

    console.error(
      "Change role error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to change role"
    });

  }
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

  me,

  listUsers,

  referrals,

  myReferrals,

  myNetwork,

  listTeamLeaders,

  distributionManagerSuperTeamLeaders,

  ctoMembers,

  ctoTeamLeaders,

  ctoSuperTeamLeaders,

  assignTeam,

  ctoChangeRole,

  changeRole

};