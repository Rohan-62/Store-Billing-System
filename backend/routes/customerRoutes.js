const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Bill = require("../models/Bill");
const { verifyToken } = require("../middleware/auth");

// Get all customers or search by mobile
router.get("/", verifyToken, async (req, res) => {
  try {
    const { mobile } = req.query;
    let query = {};
    if (mobile) query.mobile = { $regex: mobile };
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID with their bills
router.get("/:id/bills", verifyToken, async (req, res) => {
  try {
    const bills = await Bill.find({ customerId: req.params.id }).sort({ date: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
