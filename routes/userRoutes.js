const crypto = require("crypto");

router.post("/login", async (req, res) => {
  try {
    const { internshipId, email, dob } = req.body;

    const user = await User.findOne({
      internshipId,
      email,
    });

    // ❌ If user not in Excel database
    if (!user) {
      return res.status(401).json({
        message: "You are not authorized. Data not found.",
      });
    }

    // ❌ DOB mismatch
    if (user.dateOfBirth !== dob) {
      return res.status(401).json({
        message: "Invalid Date of Birth",
      });
    }

    // 🔴 If not approved
    if (!user.isApproved) {

      // Send approval mail only first time
      if (!user.approvalRequested) {
        const token = crypto.randomBytes(32).toString("hex");

        user.approvalToken = token;
        user.approvalRequested = true;
        await user.save();

        await sendApprovalMailToAdmin(user);
      }

      return res.status(403).json({
        message: "Approval request sent to admin. Please wait.",
      });
    }

    // ✅ If approved
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});