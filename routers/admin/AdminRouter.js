// express
const express = require("express")
const route = express.Router()

// products Module 
const productsModule = require("../../modules/admin/productsModule")
const usersModule = require("../../modules/admin/usersModule")
const ordersModule = require("../../modules/admin/ordersModule")
const categoriesModule = require("../../modules/admin/categoriesModule")
const attributesModule = require("../../modules/admin/attributesModule")


// routes : "/admin"
route.get("/",(req ,res) => {
    res.send("dashboard")
})
// "/admin/products"
route.use("/products",productsModule)

// "/admin/account"
route.use("/account",usersModule)

// "/admin/account/categories"
route.use("/account/categories",categoriesModule)

// "/admin/account/categories"
route.use("/account/attributes",attributesModule)

// "/admin/orders"
route.use("/orders", ordersModule)

module.exports = route