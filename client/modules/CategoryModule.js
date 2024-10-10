const express = require("express");
const { category_get_categories } = require("../controllers/CategoryControllers");
const categoryModule = express.Router();

// /client/categories

// GET all categories
categoryModule.get("/", category_get_categories)

module.exports = categoryModule