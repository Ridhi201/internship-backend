const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendApprovalMailToAdmin = async (user) => {

  const approveLink = `${process.env.BASE_URL}/api/admin/approve/${user.approvalToken}`;

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: process.env.ADMIN_EMAIL,

    subject: "New User Approval Required",

    html: `
    <h2>New User Registered</h2>

    <p>Name: ${user.name}</p>

    <p>Email: ${user.email}</p>

    <br/>

    <a href="${approveLink}" 
    style="
    padding:12px 20px;
    background:green;
    color:white;
    text-decoration:none;
    border-radius:6px;
    ">

    Approve User

    </a>
    `
  });

};

const sendOTPToAdmin = async (otp) => {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "Admin Login OTP - Certificate Portal",
    html: `
    <h2>Admin Approval Required</h2>
    <p>A user is attempting to login/request a certificate. Please provide them with the following OTP:</p>
    <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff;">${otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    `
  });
};

const sendApprovalMailToUser = async (user, downloadLink) => {
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
};

const sendCertificateRequestToAdmin = async (user, approveLink) => {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "Certificate Approval Request",
    html: `
      <h3>New Certificate Request</h3>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Internship ID:</strong> ${user.internshipId}</p>

      <a href="${approveLink}">
        <button style="padding:10px 20px;background:green;color:white;border:none;border-radius:5px;cursor:pointer;">
          Approve Certificate
        </button>
      </a>
    `
  });
};

module.exports = { 
  sendApprovalMailToAdmin, 
  sendOTPToAdmin, 
  sendCertificateRequestToAdmin,
  sendApprovalMailToUser 
};