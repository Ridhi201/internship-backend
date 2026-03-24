require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
console.log("Attempting to connect to MongoDB...");
console.log("URI:", uri);

mongoose.connect(uri)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  });
