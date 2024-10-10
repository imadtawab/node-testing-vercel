// express
const express = require("express");
const orderModule = express.Router();
const { slugify } = require("../utils/slugifyUtils");
const { storage } = require("../utils/mediaUtils");
const { order_get_orders, order_patch_status, order_delete_order, order_update_manyOrdersStatus, order_delete_manyOrders, order_get_order, order_patch_personalNote, order_delete_status, order_get_ordersTrackingStatus, order_get_trackingStatus, order_get_trackingDetails, order_get_dashboardStatics } = require("../controllers/OrderControllers");

// GET All Orders
orderModule.get("/", order_get_orders)
// Change Status
orderModule.patch("/change-status/:id", order_patch_status)
// Delete product
orderModule.delete("/:id", order_delete_order)
// Update Many Status
orderModule.patch("/many/update-status", order_update_manyOrdersStatus)
// Delete Many products
orderModule.post("/many/delete", order_delete_manyOrders)
// orders tracking status
orderModule.get("/tracking-status", order_get_trackingStatus)
// dashboard-order-statics
orderModule.get("/dashboard-order-statics", order_get_dashboardStatics)
// get order tracking details
orderModule.get("/orders-tracking/details/:id", order_get_trackingDetails)
// GET order
orderModule.get("/:id", order_get_order)
// GET order
orderModule.patch("/new-personal-note/:id", order_patch_personalNote)
// delete order status
orderModule.patch("/delete-order-status/:id", order_delete_status)


module.exports = orderModule