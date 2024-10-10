const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
  shoppingCart: [
    {
        // productOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        _id: String,
        total_price: Number,
        total_quantity: Number,
        name: String,
        image: String,
        category: {
          name: String,
          _id: String
        },
        variants: [{
            _id: String,
            name: String,
            image: String,
            sku: String,
            price: Number,
            quantity: Number
        }]
    }
  ],
  userId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  customer_notes: {
    type: String,
    required: false,
  },
  personal_notes: {
    type: Array,
    required: false,
    default: []
  },
  status: {
    type: Array,
    default: [{name: "pending",addedIn: Date.now()}],
  },
  current_status: {
    type: Object,
    default: {name: "pending",addedIn: Date.now()}
  },
  shippingMethod: {
    _id: String,
    name: String,
    cost: Number,
    estimated_delivery: String,
    min_amount: Number,
  },
    // discount: Number,
    // couponType: String,
    coupon: {
      type: Object,
      default: null
    },
  shippingCost: Number,
  subtotal: {
    type: Number,
  },
  total_price: {
    type: Number,
  },
  total_quantity: {
    type: Number,
  },
} ,{
  timestamps: true
});

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
