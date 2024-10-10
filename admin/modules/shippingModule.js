// express
const express = require("express");
const { shipping_post_newMethod, shipping_getMethods, shipping_patch_visibility, shipping_delete_method } = require("../controllers/ShippingControllers");
const shippingModule = express.Router();

shippingModule.post("/new", shipping_post_newMethod)
shippingModule.get("/", shipping_getMethods)
shippingModule.patch("/change-visibility/:id", shipping_patch_visibility)
shippingModule.delete("/:id", shipping_delete_method)



module.exports = shippingModule