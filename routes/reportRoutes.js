const express = require("express");
const router = express.Router();
const { processDaysheetCSV } = require("../utils/csvProcessor");
const User = require("../models/User");
const { exec } = require("child_process");
const path = require("path");

// Sync data from ERPCA CSV
router.post("/sync", async (req, res) => {
  try {
    await processDaysheetCSV();
    res.status(200).json({ message: "Data synced successfully from CSV" });
  } catch (error) {
    res.status(500).json({ message: "Failed to sync data", error: error.message });
  }
});

// Trigger Python automation script and then sync
router.post("/trigger-automation", (req, res) => {
  const scriptPath = path.join(__dirname, "../../automation/erpca_automation.py");
  
  console.log(`Triggering automation script at: ${scriptPath}`);
  
  exec(`python "${scriptPath}"`, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ message: "Automation failed", error: error.message });
    }
    
    console.log(`Script Output: ${stdout}`);
    
    try {
      await processDaysheetCSV();
      res.status(200).json({ message: "Automation and Sync completed successfully", output: stdout });
    } catch (syncError) {
      res.status(500).json({ message: "Automation succeeded but sync failed", error: syncError.message });
    }
  });
});

// Get work report for a specific user
router.get("/work-report/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      tasks: user.tasks,
      hours: user.hours
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching work report", error: error.message });
  }
});

module.exports = router;
