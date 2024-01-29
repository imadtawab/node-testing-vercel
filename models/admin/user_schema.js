const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
 avatar:{
  type: String,
 },
 phone:{
  type: String,
 },
 isActive: {
  type: Boolean,
  default: false
},
activationCode: String,
forgotPasswordCode: String
},{
  timestamps: true
});

const users = mongoose.model("users", userSchema);

module.exports = users;
