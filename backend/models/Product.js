const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true }, // selling price
  costPrice: { type: Number, required: true, default: 0 }, // for profit tracking
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
