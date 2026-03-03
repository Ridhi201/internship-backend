const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const path = require("path");

// ===============================
// EMAIL TRANSPORTER (Reusable)
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS
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
    const downloadLink = `http://localhost:3000/download/${user._id}`;

    // Send Email to User
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: user.email,
      subject: "Certificate Approved - Permission Granted",
      html: `
        <h2>Permission Granted ✅</h2>
        <p>Hello ${user.name},</p>
        <p>Your internship certificate has been approved.</p>

        <a href="${downloadLink}">
          <button style="
            padding:12px 20px;
            background-color:#007bff;
            color:white;
            border:none;
            border-radius:5px;
            cursor:pointer;">
            Download Certificate
          </button>
        </a>

        <p>Thank you.</p>
      `
    });

    res.send("Certificate Approved & Email Sent Successfully");

  } catch (error) {
    res.status(500).send(error.message);
  }
});


// ===============================
// CERTIFICATE DOWNLOAD ROUTE
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

    // Path to certificate file
    const filePath = path.join(__dirname, "../certificate.pdf");

    res.download(filePath, `${user.name}_Certificate.pdf`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;