const Coupon = require("../../models/CouponSchema");
const paginationHandler = require("../utils/paginationUtils");
const rejectError = require("../../mainUtils/rejectError");

let couponControllers = {}


couponControllers.coupon_get_coupons = (req, res) => {
    let {page, step, search, type, publish, from, to} = req.query

    let filters = {userId: req.userId}
    if(search) filters.code = {"$regex" : new RegExp(`.*${search}.*`, 'i')}
    if(type) filters.type = type
    if(publish) filters.publish = publish
    if(from || req.query.to) {
        filters.createdAt = {}
        if(from) filters.createdAt["$gte"] = new Date(from).getTime()
        if(to) filters.createdAt["$lte"] = new Date(to).setHours(23, 59, 59, 999)
    }
    Coupon.find(filters).then(data => {
        res.status(200).json({...paginationHandler(data, {page, step}), query: req.query});
    }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_post_newCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.findOne({code: req.body.code})
        if(coupon) return rejectError(req, res, null, "The coupon code has already been used.")
    } catch (err) {
        rejectError(req, res, err)
    }
        new Coupon({...req.body, userId: req.userId}).save().then((coupon) => {
                res.status(200).json({message: "Coupon has been created successfully."});
        }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_post_editCoupon = (req, res) => {
    console.log(req.body);
            Coupon.updateOne({userId: req.userId, _id: req.params.id}, req.body).then(() => {
                res.status(200).json({message: "The coupon has been updated."})
            }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_get_coupon = (req, res) => {
    Coupon.findOne({userId: req.userId, _id: req.params.id}).then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_delete_coupon = (req, res) => {
    Coupon.findByIdAndDelete({userId: req.userId, _id: req.params.id}).then(coupon => {
            res.status(200).json({message: "The coupon has been deleted."});
    }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_patch_visibility = (req, res) => {
    Coupon.updateOne({userId: req.userId, _id: req.params.id}, {publish: !req.body.publish}).then(() => {
        res.status(200).json({message: "The visibility has been updated."})
    }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_delete_manyCoupons = (req, res) => {

            Coupon.deleteMany({_id: req.body.itemsSelected}).then((docs) => {
                res.status(200).json({message: `${docs.deletedCount} coupons has been deleted.`})
            }).catch(err => rejectError(req, res, err))
}
couponControllers.coupon_update_manyCouponsVisibility = (req, res) => {
    Coupon.updateMany({userId: req.userId, _id: req.body.itemsSelected}, {publish: req.body.publish}).then((docs) => {
                res.status(200).json({message: `${req.body.itemsSelected.length} coupons has been changed to ${req.body.publish ? "publish" : "not publish"}.`})
    }).catch(err => rejectError(req, res, err))
}
module.exports = couponControllers