const { GoogleGenAI } = require("@google/genai");
const Bill = require("../models/Bill");
const Product = require("../models/Product");

class AIService {
  constructor() {
    this.client = null;
    this.enabled = false;
  }

  initialize() {
    if (process.env.GEMINI_API_KEY) {
      try {
        const key = process.env.GEMINI_API_KEY;
        // In 2026, 'AQ.' keys often require cloud-specific initialization.
        if (key.startsWith("AQ.")) {
          this.client = new GoogleGenAI({ 
            apiKey: key,
          });
          console.log("✅ Gemini AI Service initialized (Vertex-ready key)");
        } else {
          this.client = new GoogleGenAI({ apiKey: key });
          console.log("✅ Gemini AI Service initialized");
        }
        this.enabled = true;
      } catch (err) {
        console.error("❌ Failed to initialize Gemini AI Service:", err.message);
      }
    } else {
      console.log("ℹ️ Gemini API key not set — AI features disabled");
    }
  }

  async getProductRecommendations(cartProductIds) {
    if (!this.enabled) throw new Error("AI features not configured. Add GEMINI_API_KEY to .env");

    const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
    const cartNames = cartProducts.map(p => p.name);

    const relatedBills = await Bill.find({
      "products.productId": { $in: cartProductIds }
    }).limit(50);

    const coProductCount = {};
    relatedBills.forEach(bill => {
      bill.products.forEach(p => {
        if (!cartProductIds.includes(p.productId.toString())) {
          coProductCount[p.name] = (coProductCount[p.name] || 0) + 1;
        }
      });
    });

    const topCoPurchased = Object.entries(coProductCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (bought ${count} times)`);

    const prompt = `You are a retail analytics assistant. Suggest 3-5 products to cross-sell.
Cart content: ${cartNames.join(", ")}.
Frequent co-purchases: ${topCoPurchased.join("; ") || "No data yet"}.

Format as a numbered list with brief explanations.`;

    try {
      const result = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      
      return {
        recommendations: result.text,
        coPurchasedData: topCoPurchased
      };
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      throw err;
    }
  }

  async getTrendAnalysis(days = 30) {
    if (!this.enabled) throw new Error("AI features not configured");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const bills = await Bill.find({ date: { $gte: startDate } });
    
    let totalRevenue = 0;
    const productSales = {};
    bills.forEach(bill => {
      totalRevenue += bill.total;
      bill.products.forEach(p => {
        productSales[p.name] = (productSales[p.name] || 0) + p.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const summary = `Data for last ${days} days:
Total Revenue: $${totalRevenue.toFixed(2)}
Total Bills: ${bills.length}
Top Products: ${topProducts.map(([name, qty]) => `${name} (${qty} sold)`).join(", ")}`;

    const prompt = `Analyze this retail data and provide 3 key insights and 3 recommendations:
${summary}`;

    try {
      const result = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      return {
        analysis: result.text,
        rawData: { totalRevenue, totalBills: bills.length, topProducts }
      };
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      throw err;
    }
  }

  async queryAssistant(question) {
    if (!this.enabled) throw new Error("AI features not configured");

    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } });

    const context = `Store Stats:
- Total Products: ${totalProducts}
- Low Stock items: ${lowStock.length}
- Today's date: ${new Date().toLocaleDateString()}`;

    try {
      const result = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: context + "\n\nUser Question: " + question }] }]
      });

      return { answer: result.text };
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      throw err;
    }
  }
}

module.exports = new AIService();
