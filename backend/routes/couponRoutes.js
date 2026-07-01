const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { verifyToken, requireRole } = require("../middleware/auth");

// List all coupons (Admin)
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ expiresAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create coupon (Admin)
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Validate coupon (Public-ish, used during billing)
router.post("/validate", verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ error: "Invalid or inactive coupon" });
    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: "Coupon has expired" });
    }
    
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete/Deactivate coupon (Admin)
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    
    coupon.active = false;
    await coupon.save();
    res.json({ message: "Coupon deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
