const Coupon = require("../../models/CouponSchema")
const rejectError = require("../../mainUtils/rejectError")

let couponControllers = {}

couponControllers.coupon_post_checkPromoCode = (req, res) => {
    if(!req.body.promoCode) return res.status(200).json({message: "Please enter a coupon code." , checked: false})
    Coupon.findOne({userId: req.userId, publish: true, code: req.body.promoCode}).select(["code", "type", "discount", "description", "expirationDate"]).then(coupon => {
        if(coupon) {
            const dateExpirationHandler = (date) => {
                let d = new Date(date).setHours(23, 59, 59, 999)
                let now = new Date().setHours(23, 59, 59, 999)
                return d >= now
            }
              if(dateExpirationHandler(coupon.expirationDate)) {
                    
                  res.status(200).json({message: coupon.description , checked: true, coupon})
                } else {
                res.status(200).json({message: "The promo code is expired." , checked: false})
              }
        } else {
            res.status(200).json({message: `Coupon "${req.body.promoCode}" does not exist!` , checked: false})
        }
    }).catch(err =>  rejectError(req, res, err))
}
module.exports = couponControllers