const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ===============================
// LOGIN (Sheet Based)
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { internshipId, name } = req.body;

    if (!internshipId || !name) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({
      internshipId: internshipId.trim(),
      name: name.trim()
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid Internship ID or Name" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// REQUEST CERTIFICATE
// ===============================
router.post("/request-certificate/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.certificateRequested) {
      return res.status(400).json({ message: "Certificate already requested" });
    }

    user.certificateRequested = true;
    await user.save();

    // Admin approval link
    const approveLink = `http://localhost:5000/api/admin/approve/${user._id}`;

    // Email Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS
      }
    });

    // Send Email to Admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "Certificate Approval Request",
      html: `
        <h3>New Certificate Request</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Internship ID:</strong> ${user.internshipId}</p>

        <a href="${approveLink}">
          <button style="padding:10px 20px;background:green;color:white;border:none;border-radius:5px;">
            Approve Certificate
          </button>
        </a>
      `
    });

    res.status(200).json({ message: "Request sent to Admin successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;