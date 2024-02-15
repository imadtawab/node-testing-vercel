// express
const express = require("express")
const productsModule = require("../../modules/client/ProductModule")
const categoriesModule = require("../../modules/client/CategoriesModule")
const attributesModule = require("../../modules/client/AttributesModule")
const route = express.Router()




// "/client/"
route.use("/products",productsModule)
route.use("/categories",categoriesModule)
route.use("/attributes",attributesModule)

module.exports = route