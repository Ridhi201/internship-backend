const XLSX = require("xlsx");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const newInterns = [
  {
    "InternshipId": "STG-100006",
    "Name": "Shubham Maru",
    "Date of Birth": "25-12-1997",
    "Email": "smaru5555@gmail.com",
    "Duration": "12 Months"
  },
  {
    "InternshipId": "STG-100007",
    "Name": "shubham laddha",
    "Date of Birth": "11-11-2005",
    "Email": "shubhamladdha2@gmail.com",
    "Duration": "6 Months"
  },
  {
    "InternshipId": "STG-100008",
    "Name": "Nikhil Soni",
    "Date of Birth": "07-05-2004",
    "Email": "nikhil44soni7@gmail.com",
    "Duration": "6 Months"
  },
  {
    "InternshipId": "STG-100009",
    "Name": "Ronak Sukhwal",
    "Date of Birth": "09-09-2003",
    "Email": "ronaksukhwal5@gmail.com",
    "Duration": "4 Months"
  },
  {
    "InternshipId": "STG-100010",
    "Name": "kratika Solanki",
    "Date of Birth": "03-06-2003",
    "Email": "kratikasolanki030@gmail.com",
    "Duration": "6 Months"
  },
  {
    "InternshipId": "STG-100011",
    "Name": "Ridhima Mishra",
    "Date of Birth": "21-06-2003",
    "Email": "mishraridhima21@gmail.com",
    "Duration": "6 Months"
  },
  {
    "InternshipId": "STG-100012",
    "Name": "Rishika Mishra",
    "Date of Birth": "21-06-2003",
    "Email": "rishikamishra062@gmail.com",
    "Duration": "6 Months"
  },
  {
    "InternshipId": "STG-100013",
    "Name": "Priyanka prajapa",
    "Date of Birth": "13-09-2004",
    "Email": "priynkaembient01@gmail.com",
    "Duration": "3 Months"
  }
];

async function run() {
  const filePath = path.join(__dirname, "internship_data.xlsx");
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    console.log("Existing file not found, creating new one.");
    workbook = XLSX.utils.book_new();
  }
  
  const sheetName = workbook.SheetNames[0] || "Sheet1";
  let existingData = [];
  if (workbook.Sheets[sheetName]) {
    existingData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }
  
  // Update or append
  for (const intern of newInterns) {
    const idx = existingData.findIndex(item => {
        // Handle potential trimming issues in existing data keys
        const id = item.InternshipId || item["InternshipId "] || item[" InternshipId"];
        return id === intern.InternshipId;
    });
    if (idx > -1) {
      existingData[idx] = { ...existingData[idx], ...intern };
    } else {
      existingData.push(intern);
    }
  }
  
  const newSheet = XLSX.utils.json_to_sheet(existingData);
  workbook.Sheets[sheetName] = newSheet;
  if (!workbook.SheetNames.includes(sheetName)) workbook.SheetNames.push(sheetName);
  
  XLSX.writeFile(workbook, filePath);
  console.log("Updated internship_data.xlsx successfully.");

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not found in .env");
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  for (const intern of existingData) {
    const internshipId = intern.InternshipId || intern["InternshipId "] || intern[" InternshipId"];
    const name = intern.Name || intern["Name "] || intern[" Name"];
    const dob = intern["Date of Birth"] || intern["Date of Birth "] || intern[" Date of Birth"];
    const email = intern.Email || intern["Email "] || intern[" Email"];
    const duration = intern.Duration || intern["Duration "] || intern[" Duration"];

    if (!internshipId) continue;

    await User.updateOne(
      { internshipId: internshipId.toString().trim() },
      {
        internshipId: internshipId.toString().trim(),
        name: name ? name.toString().trim() : "",
        dateOfBirth: dob ? dob.toString().trim() : "",
        email: email ? email.toString().trim() : "",
        duration: duration ? duration.toString().trim() : ""
      },
      { upsert: true }
    );
  }

  console.log("MongoDB updated successfully.");
  await mongoose.disconnect();
}

run().catch(console.error);
