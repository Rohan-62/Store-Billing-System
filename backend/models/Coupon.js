const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ["percentage", "flat"], required: true },
  value: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date }
});

module.exports = mongoose.model("Coupon", couponSchema);
