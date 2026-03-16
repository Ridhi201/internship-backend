const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// ===============================
// LOGIN (Sheet Based - Now with OTP)
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { internId, email, dob } = req.body;

    if (!internId || !email || !dob) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let formattedDob = dob.trim();
    // Transform YYYY-MM-DD to DD-MM-YYYY if needed
    if (formattedDob.includes("-") && formattedDob.split("-")[0].length === 4) {
      const [year, month, day] = formattedDob.split("-");
      formattedDob = `${day}-${month}-${year}`;
    }

    const user = await User.findOne({
      internshipId: { $regex: new RegExp(`^${internId.trim()}$`, "i") },
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
      dateOfBirth: formattedDob
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid internship details." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP to Admin
    const { sendOTPToAdmin } = require("../utils/emailService");
    await sendOTPToAdmin(otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to admin. Please enter it to continue.",
      requiresOtp: true
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===============================
// VERIFY OTP
// ===============================
router.post("/verify-otp", async (req, res) => {
  try {
    const { internId, otp } = req.body;

    const user = await User.findOne({
      internshipId: { $regex: new RegExp(`^${internId.trim()}$`, "i") },
      otp: otp.trim(),
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark as approved (if needed for certificate access)
    user.isApproved = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        internshipId: user.internshipId,
        tasks: user.tasks || 0,
        hours: user.hours || 0,
        certificateApproved: user.certificateApproved || false,
        certificateRequested: user.certificateRequested || false,
        position: user.position || "Intern",
        duration: user.duration || "One Month",
        startDate: user.startDate || "",
        endDate: user.endDate || "",
        issueDate: user.issueDate || "",
        workDetails: user.workDetails || []
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ===============================
// REQUEST CERTIFICATE (Direct Link)
// ===============================
router.post("/request-certificate/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Admin approval link
    const approveLink = `http://localhost:5000/api/admin/approve/${user._id}`;

    // Send final Request Email to Admin
    const { sendCertificateRequestToAdmin } = require("../utils/emailService");
    await sendCertificateRequestToAdmin(user, approveLink);

    // Mark as requested
    user.certificateRequested = true;
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Approval link sent to Admin successfully!" 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;