const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String, required: true }, // stored directly to avoid population issues
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  discount: {
    couponCode: { type: String },
    type: { type: String },
    value: { type: Number },
    amount: { type: Number, default: 0 }
  },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", billSchema);
