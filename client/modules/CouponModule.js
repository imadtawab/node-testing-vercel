// express
const express = require("express");
const { coupon_post_checkPromoCode } = require("../controllers/CouponControllers");
const couponModule = express.Router();

couponModule.post("/check", coupon_post_checkPromoCode)
module.exports = couponModule