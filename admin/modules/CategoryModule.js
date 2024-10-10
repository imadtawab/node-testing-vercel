const express = require("express");
const { category_get_categories, category_post_newCategory, category_get_category, category_delete_category, category_patch_category, category_post_checkSlug, category_patch_visibility, category_update_manyCategoriesVisibility, category_delete_manyCategories, category_post_editCategory, category_get_categoriesForProduct } = require("../controllers/CategoryControllers");
const { validateCategorySchema, validateEditCategorySchema } = require("../utils/categroyUtils");
const { storage } = require("../utils/mediaUtils");
const { slugify } = require("../utils/slugifyUtils");
const categoryModule = express.Router();

// /admin/categories

// GET all categories
categoryModule.get("/", category_get_categories)
categoryModule.get("/for-product", category_get_categoriesForProduct)
// New attribute
categoryModule.post("/new", storage.single("image"), validateCategorySchema, slugify, category_post_newCategory)
// Check Slug
categoryModule.post("/new/check-slug", slugify, category_post_checkSlug)
// Edit Category
categoryModule.post("/edit/:id", storage.single("image"), validateEditCategorySchema, slugify, category_post_editCategory)
// GET category
categoryModule.get("/:id", category_get_category)
// Delete Many categories
categoryModule.post("/many/delete", category_delete_manyCategories)
// Update Many categories Visibility
categoryModule.post("/many/update-visibility", category_update_manyCategoriesVisibility)
// Delete category
categoryModule.delete("/:id", category_delete_category)
// // Update category
// categoryModule.patch("/:id", category_patch_category)
// Change visibility of category
categoryModule.patch("/change-visibility/:id", category_patch_visibility)

module.exports = categoryModule