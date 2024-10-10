    // express
const express = require("express")
const adminRouter = express.Router()
const accountModule = require("../admin/modules/AccountModule")
const auth = require("../admin/utils/auth")
const attributeModule = require("../admin/modules/AttributeModule")
const categoryModule = require("../admin/modules/CategoryModule")
const productModule = require("../admin/modules/ProductModule")
const orderModule = require("../admin/modules/OrderModule")
const shippingModule = require("../admin/modules/shippingModule")
const couponModule = require("../admin/modules/CouponModule")



// "/admin/"
adminRouter.use("/account", accountModule)
adminRouter.use("/attributes", auth, attributeModule)
adminRouter.use("/coupons", auth, couponModule)
adminRouter.use("/categories", auth, categoryModule)
adminRouter.use("/products", auth, productModule)
adminRouter.use("/orders", auth, orderModule)
adminRouter.use("/shipping-methods", auth, shippingModule)


module.exports = adminRouter