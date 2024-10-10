// express
const express = require("express");
const { attribute_post_value, attribute_delete_value, attribute_patch_value, attribute_get_attributes, attribute_post_newAttribute, attribute_get_attribute, attribute_delete_attribute, attribute_patch_attribute, attribute_patch_visibility, attribute_delete_manyAttributes, attribute_update_manyAttributesVisibility, attribute_post_editAttribute } = require("../controllers/AttributeControllers");
const { validateAttributeSchema, validateEditAttributeSchema } = require("../utils/attributeUtils");
const attributeModule = express.Router();

// "/admin/attributes"

// // new value
// attributeModule.post("/values/:attrId", attribute_post_value)
// // Delete value
// attributeModule.delete("/values/:attrId/:id", attribute_delete_value)
// // Update value
// attributeModule.patch("/values/:attrId/:id", attribute_patch_value)

// GET all attributes
attributeModule.get("/", attribute_get_attributes)
// New attribute
attributeModule.post("/new", validateAttributeSchema, attribute_post_newAttribute)
// Edit attribute
attributeModule.post("/edit/:id", validateEditAttributeSchema, attribute_post_editAttribute)
// GET attribute
attributeModule.get("/:id", attribute_get_attribute)
// Delete Many Attributes
attributeModule.post("/many/delete", attribute_delete_manyAttributes)
// Update Many Attributes Visibility
attributeModule.post("/many/update-visibility", attribute_update_manyAttributesVisibility)
// Delete attribute
attributeModule.delete("/:id", attribute_delete_attribute)
// // Update attribute
// attributeModule.patch("/:id", validateAttributeSchema, attribute_patch_attribute)
// Change visibility of attribute
attributeModule.patch("/change-visibility/:id", attribute_patch_visibility)

module.exports = attributeModule;
