const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const filePath = "c:\\Users\\Gaurav\\Downloads\\Certificate_Application - Copy - Copy\\internship-backend\\data\\daysheet_report.xls";
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Unique Resources:", [...new Set(data.map(r => r["Resource"]))]);
console.log("Ridhima rows:", data.filter(r => r["Resource"] && r["Resource"].includes("Ridhima")).map(r => ({ text: r["Task Text"], remarks: r["Remarks/Activity"] })));
