require("dotenv").config();
const mongoose = require("mongoose");
const { processDaysheetCSV } = require("./utils/csvProcessor");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Triggering report sync...");
    await processDaysheetCSV();
    console.log("Sync finished.");
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
