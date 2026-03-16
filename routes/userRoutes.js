const express = require("express");

const router = express.Router();

const crypto = require("crypto");

const User = require("../models/User");

const { sendApprovalMailToAdmin } = require("../utils/emailService");


router.post("/register", async (req,res)=>{

  const {name,email,password,internshipId,dateOfBirth}=req.body;

  const token = crypto.randomBytes(32).toString("hex");

  const newUser = new User({

    name,
    email,
    password,
    internshipId,
    dateOfBirth,

    approvalToken: token,

    approvalTokenExpires: Date.now()+86400000

  });

  await newUser.save();

  await sendApprovalMailToAdmin(newUser);

  res.json({
    message:"Registration successful. Waiting for admin approval."
  });

});


router.get("/user-approve/:token", async (req,res)=>{

  const user = await User.findOne({

    approvalToken:req.params.token,

    approvalTokenExpires:{ $gt: Date.now() }

  });

  if(!user){
    return res.send("Invalid or expired link");
  }

  user.isApproved=true;

  user.approvalToken=undefined;

  user.approvalTokenExpires=undefined;

  await user.save();

  res.send("User Approved Successfully");

});

module.exports = router;