const mongoose = require("mongoose");
module.exports = mongoose.model("Category", new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true }));
