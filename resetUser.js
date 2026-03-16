require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const internId = process.argv[2] || "STG-100011";
  const result = await User.updateOne(
    { internshipId: internId },
    { $set: { certificateRequested: false, certificateApproved: false } }
  );
  console.log(`Reset for ${internId}:`, result.modifiedCount === 1 ? "✅ Done" : "⚠️ Not found");
  const user = await User.findOne({ internshipId: internId });
  if (user) {
    console.log("Current state → requested:", user.certificateRequested, "approved:", user.certificateApproved, "tasks:", user.tasks, "hours:", user.hours);
  }
  process.exit();
}).catch(e => { console.error(e.message); process.exit(1); });
