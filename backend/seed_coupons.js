const mongoose = require("mongoose");
require("dotenv").config();
const Coupon = require("./models/Coupon");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  await Coupon.deleteMany({});
  const coupons = [
    { code: "SAVE10", type: "percentage", value: 10 },
    { code: "FLAT50", type: "flat", value: 50 }
  ];
  await Coupon.insertMany(coupons);
  console.log("Created coupons: SAVE10, FLAT50");
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
