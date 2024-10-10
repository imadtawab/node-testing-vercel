const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // display_name: {
  //   type: String,
  //   required: true,
  // },
  type: {
    type: String,
    required: true,
  },
  cost:{
    type: Number,
    required: true,
    default: 0
    },
    rangeAmount: {
        min_amount: Number,
        cost: Number
        },
 estimated_delivery: {
    type: String,
  },
 publish: {
    type: Boolean,
    default: false
  }
},{
  timestamps: true
});

const Shipping = mongoose.model("shipping", shippingSchema);

module.exports = Shipping;
