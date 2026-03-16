require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const testEmail = async () => {
  console.log("Starting SMTP Test...");
  console.log("Using Email: " + process.env.EMAIL_USER);
  console.log("Using Pass: " + process.env.EMAIL_PASS.replace(/./g, "*"));

  try {
    await transporter.verify();
    console.log("✅ SMTP Connection Successful!");
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "SMTP Test - Certificate Project",
      text: "If you are reading this, your SMTP configuration is working correctly!"
    });

    console.log("✅ Test Email Sent: " + info.response);
  } catch (error) {
    console.error("❌ SMTP Error Occurred:");
    console.error(error.message);
    if (error.message.includes("535-5.7.8")) {
      console.log("\n💡 TIP: Use a Google App Password (16 characters). Your current password might be incorrect or revoked.");
      console.log("Generate a new one at: https://myaccount.google.com/apppasswords");
    }
  }
};

testEmail();
