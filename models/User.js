const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: String,

  email: String,

  password: String,

  internshipId: String,

  dateOfBirth: String,

  isApproved: {
    type: Boolean,
    default: false
  },

  approvalToken: String,
  approvalTokenExpires: Date,
  otp: String,
  otpExpires: Date,
  tasks: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  workDetails: [
    {
      date: String,
      task: String,
      hours: String
    }
  ],
  certificateApproved: { type: Boolean, default: false },
  certificateRequested: { type: Boolean, default: false },
  position: { type: String, default: "Intern" },
  duration: { type: String, default: "One Month" },
  startDate: String,
  endDate: String,
  issueDate: String

});

module.exports = mongoose.model("User", userSchema);