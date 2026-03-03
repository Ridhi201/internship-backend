const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  internshipId: String,
  dateOfBirth: String,
  certificateUrl: String,

  isApproved: {
    type: Boolean,
    default: false,
  },

  approvalRequested: {
    type: Boolean,
    default: false,
  },

  approvalToken: String,
});

module.exports = mongoose.model("User", userSchema);