const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const billRoutes = require("./routes/billRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const couponRoutes = require("./routes/couponRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const aiRoutes = require("./routes/aiRoutes");
const whatsappService = require("./services/whatsapp");
const aiService = require("./services/aiService");
const User = require("./models/User");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/ai", aiRoutes);

// Initialize WhatsApp
whatsappService.initialize();

// Initialize AI Service
aiService.initialize();

// Function to create default admin user
const createDefaultAdmin = async () => {
  try {
    const user = await User.findOne({ username: "admin" });
    if (!user) {
      const adminUser = new User({ 
        username: "admin", 
        password: "admin123", 
        role: "admin" 
      });
      await adminUser.save();
      console.log("✅ Default admin user created: username=admin, password=admin123");
    } else {
      // Migration: If admin password is the default one and likely in plain text, update it
      // Actually, since we added a pre-save hook, saving it again will hash it.
      // But we only want to do this if we are SURE it's the plain text one.
      // Alternatively, let's just update the role if missing.
      if (!user.role) {
        user.role = "admin";
        await user.save();
      }
      console.log("ℹ️ Default admin user already exists");
    }
  } catch (err) {
    console.log("❌ Error creating default admin user:", err.message);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("MongoDB connected");
  await createDefaultAdmin(); // ✅ Automatically create admin if missing
}).catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
