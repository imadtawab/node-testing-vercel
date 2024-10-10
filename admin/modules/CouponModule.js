// express
const express = require("express");
const {coupon_get_coupons, coupon_post_newCoupon, coupon_get_coupon, coupon_delete_coupon, coupon_patch_coupon, coupon_patch_visibility, coupon_delete_manyCoupons, coupon_update_manyCouponsVisibility, coupon_post_editCoupon } = require("../controllers/CouponControllers");
const couponModule = express.Router();

// "/admin/coupons"

// GET all coupons
couponModule.get("/", coupon_get_coupons)
// New coupon
couponModule.post("/new", coupon_post_newCoupon)
// Delete Many Coupons
couponModule.post("/many/delete", coupon_delete_manyCoupons)
// Update Many Coupons Visibility
couponModule.post("/many/update-visibility", coupon_update_manyCouponsVisibility)
// Change visibility of coupon
couponModule.patch("/change-visibility/:id", coupon_patch_visibility)
// Delete coupon
couponModule.delete("/:id", coupon_delete_coupon)
// GET coupon
couponModule.get("/:id", coupon_get_coupon)
// Edit coupon
couponModule.post("/edit/:id", coupon_post_editCoupon)


module.exports = couponModule;
