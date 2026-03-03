const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ===============================
   EMAIL TO ADMIN (WITH TOKEN LINK)
================================ */
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
const sendApprovalMailToAdmin = async (user) => {
  const approveLink = `http://localhost:5000/api/admin/approve/${user.approvalToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New User Approval Required",
    html: `
      <h3>New User Registered</h3>
      <p>Name: ${user.name}</p>
      <p>Email: ${user.email}</p>

      <br/>

      <a href="${approveLink}" 
         style="padding:12px 20px; background:green; color:white; text-decoration:none;">
         ✅ Approve User
      </a>
    `
  });
};

/* ===============================
   EMAIL TO USER AFTER APPROVAL
================================ */
const sendApprovalSuccessMail = async (user) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your Account is Approved 🎉",
    html: `
      <h2>Congratulations ${user.name} 🎉</h2>
      <p>Your account has been approved.</p>
      <p>You can now login and download your certificate.</p>
    `
  });
};

module.exports = {
  sendApprovalMailToAdmin,
  sendApprovalSuccessMail,
};