const express = require("express");
const router = express.Router();
const User = require("../models/User");
const path = require("path");
const { sendApprovalMailToUser } = require("../utils/emailService");

// ===============================
// GET ALL USERS (For Admin Dashboard)
// ===============================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "name email internshipId tasks hours certificateApproved certificateRequested");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===============================
// ADMIN APPROVAL ROUTE
// ===============================
router.get("/approve/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.certificateApproved) {
      return res.send("Certificate already approved");
    }

    // Approve Certificate
    user.certificateApproved = true;
    await user.save();

    // Download link (Frontend URL)
    const downloadLink = `http://localhost:5173/certificate`; // Updated to point to frontend cert page

    // Send Email to User
    await sendApprovalMailToUser(user, downloadLink);

    res.send("Certificate Approved & Email Sent Successfully");

  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ===============================
// CERTIFICATE DOWNLOAD ROUTE (Backend PDF)
// ===============================
router.get("/download/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.certificateApproved) {
      return res.status(403).json({ message: "Permission Not Granted" });
    }

    // Path to certificate file (Template or dynamicly generated PDF on backend)
    const filePath = path.join(__dirname, "../certificate.pdf");

    res.download(filePath, `${user.name}_Certificate.pdf`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;