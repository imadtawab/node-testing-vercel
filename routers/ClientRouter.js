    // express
    const express = require("express")
const categoryModule = require("../client/modules/CategoryModule")
const productModule = require("../client/modules/ProductModule")
const customerModule = require("../client/modules/CustomerModule")
const attributeModule = require("../client/modules/AttributeModule")
const shippingModule = require("../client/modules/shippingModule")
const couponModule = require("../client/modules/CouponModule")
const clientRouter = express.Router()
       
    // "/client/"
    clientRouter.use("/categories", categoryModule)
    clientRouter.use("/attributes", attributeModule)
    clientRouter.use("/products", productModule)
    clientRouter.use("/customers", customerModule)
    clientRouter.use("/shipping-methods", shippingModule)
    clientRouter.use("/coupons", couponModule)
    
    module.exports = clientRouter