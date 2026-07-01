const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  await User.deleteMany({});
  console.log("Cleared Users collection");
  const admin = new User({ username: "admin", password: "admin123", role: "admin" });
  await admin.save();
  console.log("Reseeded admin: admin/admin123");
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
