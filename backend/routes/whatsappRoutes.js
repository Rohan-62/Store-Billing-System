const express = require("express");
const router = express.Router();
const whatsappService = require("../services/whatsapp");
const { verifyToken } = require("../middleware/auth");

// Get WhatsApp status and QR code
router.get("/status", verifyToken, (req, res) => {
  res.json(whatsappService.getStatus());
});

// Send invoice to customer
router.post("/send-invoice", verifyToken, async (req, res) => {
  try {
    const { mobile, billData } = req.body;
    await whatsappService.sendInvoice(mobile, billData);
    res.json({ message: "Invoice sent successfully via WhatsApp" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
