// express
const express = require("express");
const { product_get_products, product_post_checkSlug, product_post_newProduct, product_delete_product, product_patch_visibility, product_update_manyProductsVisibility, product_delete_manyProducts, product_get_product, product_post_editProduct, product_get_attributesForVariants, product_post_variants } = require("../controllers/ProductControllers");
const productModule = express.Router();
const { slugify } = require("../utils/slugifyUtils");
const { storage } = require("../utils/mediaUtils");
const { validateProductSchema, validateEditProductSchema } = require("../utils/productUtils");

// GET All Products
productModule.get("/", product_get_products)
// New product
productModule.post("/new", storage.array("images"), validateProductSchema, slugify, product_post_newProduct)
// Save variants
productModule.post("/variants/:id", product_post_variants)
// Check Slug
productModule.post("/new/check-slug", slugify, product_post_checkSlug)
// Delete product
productModule.delete("/:id", product_delete_product)
// Change visibility of product
productModule.patch("/change-visibility/:id", product_patch_visibility)
// Update Many products Visibility
productModule.post("/many/update-visibility", product_update_manyProductsVisibility)
// Delete Many products
productModule.post("/many/delete", product_delete_manyProducts)
// GET product
productModule.get("/:id", product_get_product)
// GET attributes-for-variants
productModule.get("/attributes-for-variants/:id", product_get_attributesForVariants)
// Edit Product
productModule.post("/edit/:id", 
    storage.array("images"), 
    validateEditProductSchema, 
    slugify, 
    product_post_editProduct)



// // Update product
// productModule.patch("/:id", product_patch_product)

module.exports = productModule