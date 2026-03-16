const fs = require("fs");
const XLSX = require("xlsx");
const User = require("../models/User");
const path = require("path");

// Helper: Convert HH:MM:SS to Decimal Hours (e.g., 01:30:00 -> 1.5)
function timeToDecimal(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  
  const h = parseInt(parts[0]) || 0;
  const m = parseInt(parts[1]) || 0;
  const s = parseInt(parts[2]) || 0;
  
  return h + (m / 60) + (s / 3600);
}

async function processDaysheetCSV() {
  const dataDir = path.join(__dirname, "../data");
  
  if (!fs.existsSync(dataDir)) {
    console.error("Data directory not found");
    return;
  }

  // Find the report file (can be .csv, .xls, or .xlsx)
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith("daysheet_report"));
  
  if (files.length === 0) {
    console.error("No report file found in data directory");
    return;
  }

  const filePath = path.join(dataDir, files[0]);
  console.log("Processing report file:", filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const results = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Aggregate data per Resource (Name)
    const aggregatedData = {};

    for (const row of results) {
      // Clean headers (trim spaces)
      const cleanRow = {};
      Object.keys(row).forEach(key => {
        cleanRow[key.trim()] = row[key];
      });

      const resourceName = cleanRow["Resource"];
      const durationStr = cleanRow["Hrs. Spent"];
      const taskText = cleanRow["Task Text"];
      const remarks = cleanRow["Remarks/Activity"];
      const date = cleanRow["Date"];

      if (resourceName && typeof resourceName === 'string') {
        const name = resourceName.trim();
        if (!aggregatedData[name]) {
          aggregatedData[name] = { tasks: 0, hours: 0, workDetails: [] };
        }
        
        aggregatedData[name].tasks += 1; // Each row is one task
        aggregatedData[name].hours += timeToDecimal(durationStr);
        
        // Use Task Text or Remarks/Activity for detail
        const taskDescription = (taskText || remarks || "").trim();
        if (taskDescription && taskDescription !== "-") {
          aggregatedData[name].workDetails.push({
            date: date || "",
            task: taskDescription,
            hours: durationStr || "0"
          });
        }
      }
    }

    // Update Users in DB
    console.log("Found aggregated data for:", Object.keys(aggregatedData));

    for (const name of Object.keys(aggregatedData)) {
      const stats = aggregatedData[name];
      const tasks = stats.tasks;
      const hours = parseFloat(stats.hours.toFixed(2)); // Round to 2 decimal places

      console.log(`Syncing ${name}: Tasks=${tasks}, Hours=${hours}, Details=${stats.workDetails.length}`);
      
      // Update by Name mapping
      await User.updateOne(
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { 
          $inc: { // Use $inc to accumulate tasks and hours
            tasks: tasks, 
            hours: hours,
          },
          $set: { // Use $set to replace workDetails from scratch each run
            workDetails: stats.workDetails
          } 
        }
      );
    }
    
    console.log("ERPCA Data Sync Completed Successfully");
  } catch (error) {
    console.error("Error processing report:", error);
    throw error;
  }
}

module.exports = { processDaysheetCSV };
