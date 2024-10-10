const express = require("express");
const { customer_post_placeOrder, customer_post_countVisitors } = require("../controllers/CustomerControllers");
const customerModule = express.Router();

// /customers

customerModule.post("/place-order", customer_post_placeOrder)
customerModule.post("/count-vistors", customer_post_countVisitors);
module.exports = customerModule