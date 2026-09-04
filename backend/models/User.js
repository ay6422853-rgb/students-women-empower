const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  address: {
    type: String,
    required: true,
    trim: true
  },

  city: {
    type: String,
    trim: true
  },

  district: {
    type: String,
    trim: true
  },

  state: {
    type: String,
    trim: true
  },

  pincode: {
    type: String,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  aadhaarNumber: {
    type: String,
    trim: true,
    select: false
  },


  // ==========================================
  // ROLE
  // ==========================================

  role: {
    type: String,

    enum: [
      "MEMBER",
      "TEAM_LEADER",
      "SUPER_TEAM_LEADER",
      "CHIEF_TEAM_OFFICER",
      "PRODUCT_MANAGER",
      "CASH_MANAGER",
      "DISTRIBUTION_MANAGER",
      "ADMIN"
    ],

    default: "MEMBER"
  },


  // ==========================================
  // STATUS
  // ==========================================

  status: {
    type: String,

    enum: [
      "PENDING",
      "ACTIVE",
      "SUSPENDED"
    ],

    default: "ACTIVE"
  },

  // ==========================================
  // REFERRAL
  // ==========================================

  referralCode: {
    type: String,
    unique: true,
    index: true
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },


  // ==========================================
  // CTO TEAM ASSIGNMENTS
  // ==========================================

  // Member kis Team Leader ke under hai
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },


  // Team Leader kis Super Team Leader ke under hai
  superTeamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },


  // Super Team Leader ka selling Team Leader
  sellingTeamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },


  // ==========================================
  // CREATED
  // ==========================================

  createdAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);