const express = require("express");
const router = express.Router();
const aiService = require("../services/aiService");
const { verifyToken, requireRole } = require("../middleware/auth");

// Get product recommendations based on cart
router.post("/recommendations", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ error: "Please provide product IDs" });
    }
    const result = await aiService.getProductRecommendations(productIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales trend analysis
router.post("/trends", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const result = await aiService.getTrendAnalysis(days);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Natural language query assistant
router.post("/query", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Please provide a question" });
    const result = await aiService.queryAssistant(question);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
