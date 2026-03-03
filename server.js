// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const app = express();

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ MongoDB Connection
// mongoose.connect("mongodb://127.0.0.1:27017/certificateDB")
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch(err => console.log("MongoDB Error ❌", err));

// // ✅ Sample User Model (Adjust if you already have model file)
// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String
// });

// const User = mongoose.model("User", userSchema);

// // ✅ Test Route
// app.get("/", (req, res) => {
//   res.send("Backend Working ✅");
// });

// // ✅ DELETE ALL ROUTE
// app.delete("/api/admin/delete-all", async (req, res) => {
//   try {
//     await User.deleteMany({});
//     res.json({ message: "All users deleted successfully ✅" });
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting users ❌", error });
//   }
// });

// // ✅ Start Server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} 🚀`);
// });


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   REQUEST LOGGER (DEBUG)
================================ */
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url, req.body);
  next();
});

/* ===============================
   MONGODB CONNECTION (FROM .ENV)
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err));

/* ===============================
   ROUTES
================================ */

// Health check
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// User routes (login, users)
app.use("/api", userRoutes);

/* ===============================
   START SERVER (IMPORTANT FIX)
================================ */
const PORT = process.env.PORT || 5000;

// 🔥 THIS IS THE IMPORTANT PART
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} 🚀`);
});