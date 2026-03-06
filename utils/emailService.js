const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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

module.exports = { sendApprovalMailToAdmin };