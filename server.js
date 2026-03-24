require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB Connected Successfully"))
.catch(err=>{
    const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : "UNDEFINED";
    console.error("❌ MongoDB Connection Error:");
    console.error("Attempted Connection URI:", maskedUri);
    console.error(err);
    console.log("Tip: Check your Render dashboard Environment Variables. Ensure MONGO_URI is set correctly without < > brackets.");
});

app.use("/api",userRoutes);
app.use("/api",authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/reports",reportRoutes);

const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const { processDaysheetCSV } = require("./utils/csvProcessor");

module.exports = app;

app.listen(process.env.PORT,()=>{
  console.log("Server running on port " + process.env.PORT);
});


// Schedule ERPCA Automation every hour
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled ERPCA automation...");
  const scriptPath = path.join(__dirname, "automation", "erpca_automation.py");
  
  exec(`python "${scriptPath}"`, async (error, stdout, stderr) => {
    if (error) {
      console.error("Cron Job Error:", error.message);
      if (stderr) console.error("Error Details:", stderr);
      return;
    }
    console.log("Automation Script executed via cron.");
    try {
      await processDaysheetCSV();
      console.log("Scheduled Sync Completed.");
    } catch (err) {
      console.error("Scheduled Sync Failed:", err);
    }
  });
});