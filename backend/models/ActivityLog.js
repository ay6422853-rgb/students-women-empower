const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    action: {
      type: String,
      required: true,
      trim: true
    },

    targetType: {
      type: String,
      default: ""
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    ipAddress: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);