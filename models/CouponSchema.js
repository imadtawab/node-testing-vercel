const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    userId: String,
    code: {
        type: String,
        required: true,
        unique: true,
      },
      type: {
        type: String, // 'percentage' or 'fixed'
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      expirationDate: {
        type: Date,
        required: true,
      },
      publish: {
        type: Boolean,
        default: true,
      },   
      description: {
        type: String, // 'percentage' or 'fixed'
        required: true,
      }, 
},
{
timestamps: true
});

const Coupon = mongoose.model("coupon", couponSchema);

module.exports = Coupon;
