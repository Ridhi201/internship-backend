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

  approvalTokenExpires: Date

});

module.exports = mongoose.model("User", userSchema);