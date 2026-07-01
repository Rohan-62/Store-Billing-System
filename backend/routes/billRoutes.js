const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const { verifyToken, requireRole } = require("../middleware/auth");

// Add a new bill
router.post("/", verifyToken, async (req, res) => {
  try {
    const { 
      products, 
      customerName, 
      customerMobile, 
      couponCode, 
      discountType, 
      discountValue, 
      discountAmount 
    } = req.body;

    // 1. Find or create customer
    let customer = await Customer.findOne({ mobile: customerMobile });
    if (!customer) {
      customer = new Customer({ name: customerName, mobile: customerMobile });
      await customer.save();
    }

    let subtotal = 0;
    const finalProducts = [];

    // 2. Check stock and verify products
    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      subtotal += item.quantity * product.price;
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();

      finalProducts.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    const total = subtotal - (discountAmount || 0);

    const bill = new Bill({
      customerId: customer._id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      products: finalProducts,
      subtotal,
      discount: {
        couponCode,
        type: discountType,
        value: discountValue,
        amount: discountAmount
      },
      total
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bills (with search/filter)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { mobile, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (mobile) query.customerMobile = { $regex: mobile };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate revenue for filtered results
    const allFiltered = await Bill.find(query);
    const totalRevenue = allFiltered.reduce((sum, b) => sum + b.total, 0);

    res.json({
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics endpoint
router.get("/analytics", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // Stats cards
    const todayBills = await Bill.find({ date: { $gte: todayStart } });
    const weekBills = await Bill.find({ date: { $gte: weekStart } });
    const monthBills = await Bill.find({ date: { $gte: monthStart } });
    const allBills = await Bill.find();

    const stats = {
      today: {
        revenue: todayBills.reduce((s, b) => s + b.total, 0),
        count: todayBills.length
      },
      week: {
        revenue: weekBills.reduce((s, b) => s + b.total, 0),
        count: weekBills.length
      },
      month: {
        revenue: monthBills.reduce((s, b) => s + b.total, 0),
        count: monthBills.length
      },
      total: {
        revenue: allBills.reduce((s, b) => s + b.total, 0),
        count: allBills.length
      }
    };

    // Daily revenue for last 30 days
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayBills = allBills.filter(b => {
        const d = new Date(b.date);
        return d >= dayStart && d < dayEnd;
      });

      dailyRevenue.push({
        date: dayStart.toISOString().split("T")[0],
        revenue: dayBills.reduce((s, b) => s + b.total, 0),
        bills: dayBills.length
      });
    }

    // Top selling products
    const productSales = {};
    allBills.forEach(bill => {
      bill.products.forEach(p => {
        if (!productSales[p.name]) productSales[p.name] = { quantity: 0, revenue: 0 };
        productSales[p.name].quantity += p.quantity;
        productSales[p.name].revenue += p.price * p.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Profit margins (using products with costPrice)
    const products = await Product.find();
    const profitData = products
      .filter(p => p.costPrice > 0)
      .map(p => ({
        name: p.name,
        margin: ((p.price - (p.costPrice || 0)) / p.price * 100).toFixed(1),
        profit: p.price - (p.costPrice || 0)
      }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 8);

    // Low stock products
    const lowStock = products.filter(p => p.stock <= (p.lowStockThreshold || 10));

    res.json({
      stats,
      dailyRevenue,
      topProducts,
      profitData,
      lowStock: lowStock.map(p => ({ name: p.name, stock: p.stock, threshold: p.lowStockThreshold || 10 }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
