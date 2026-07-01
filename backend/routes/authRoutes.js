const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful", 
      token, 
      user: { id: user._id, username: user.username, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register route (Admin restricted in production, but open for initial setup)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: "User created", user: { username, role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
