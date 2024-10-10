// express
const express = require("express");
const { shipping_getMethods } = require("../controllers/ShippingControllers");
const shippingModule = express.Router();

shippingModule.get("/", shipping_getMethods)
module.exports = shippingModule