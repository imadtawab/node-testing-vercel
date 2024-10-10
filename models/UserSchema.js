const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
 avatar:{
  type: String,
  default: null
 },
 phone:{
  type: String,
  default: null
 },
 isActive: {
  type: Boolean,
  
  default: null
},
activationCode: String,
forgotPasswordCode: String
},{
  timestamps: true
});

const User = mongoose.model("users", userSchema);

module.exports = User;
