const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyToken, requireRole } = require("../middleware/auth");

// Get All Products (with Search and Filter)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Product (Admin Only)
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Product (Admin Only)
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Product (Admin Only)
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Stock (Admin Only)
router.patch("/:id/stock", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    product.stock += Number(quantity);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Categories
router.get("/categories", verifyToken, async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
