require("dotenv").config();
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const User = require("./models/User");
const path = require("path");

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", async () => {
  console.log("Connected to:", mongoose.connection.name);

  await importData();

  const count = await User.countDocuments();
  console.log("Total Users in DB:", count);

  process.exit();
});

async function importData() {

  const filePath = path.join(__dirname, "internship_data.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // ✅ Trim header spaces automatically
  const data = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false
  });

  for (let row of data) {

    // 🔥 Trim all keys manually (very important)
    const cleanRow = {};
    for (let key in row) {
      cleanRow[key.trim()] = row[key];
    }

    console.log("InternshipId:", cleanRow["InternshipId"]);

    await User.updateOne(
      { internshipId: cleanRow["InternshipId"] },
      {
        internshipId: cleanRow["InternshipId"],
        name: cleanRow["Name"],
        dateOfBirth: cleanRow["Date of Birth"],
        email: cleanRow["Email"],
        duration: cleanRow["Duration"]
      },
      { upsert: true }
    );
  }

  console.log("Sheet Data Imported Successfully");
}