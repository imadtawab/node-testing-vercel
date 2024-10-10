const express = require("express");
const { attribute_get_attributes } = require("../controllers/AttributeControllers");
const attributeModule = express.Router();

// /client/attributes

// GET all attributes
attributeModule.get("/", attribute_get_attributes)

module.exports = attributeModule