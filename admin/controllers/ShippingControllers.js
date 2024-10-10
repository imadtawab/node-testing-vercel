const Shipping = require("../../models/ShippingSchema")
const { removeFile } = require("../utils/mediaUtils")
const paginationHandler = require("../utils/paginationUtils")
const rejectError = require("../../mainUtils/rejectError")
const { slugify } = require("../utils/slugifyUtils")

let shippingControllers = {}

shippingControllers.shipping_post_newMethod = (req, res) => {
    console.log(req.body)
    new Shipping({
        userId: req.userId,
        ...req.body
    }).save().then(docs => {
        res.status(200).json({message: "The new shipping method was successfully created."})
    }).catch(err =>  rejectError(req, res, err))
}
shippingControllers.shipping_getMethods = (req, res) => {
    Shipping.find({userId: req.userId}).then(data => {
        res.status(200).json({data})
    }).catch(err =>  rejectError(req, res, err))
}
shippingControllers.shipping_patch_visibility = (req, res) => {
    console.log(req.params.id)
    Shipping.updateOne({_id: req.params.id}, {publish: !req.body.publish}).then(docs => {
        res.status(200).json({message: "The visibility has been updated."})
    }).catch(err =>  rejectError(req, res, err))
}
shippingControllers.shipping_delete_method = (req, res) => {
    console.log(req.params.id)
    Shipping.deleteOne({_id: req.params.id}).then(docs => {
        res.status(200).json({message: "The shipping method has been deleted."})
    }).catch(err =>  rejectError(req, res, err))
}
module.exports = shippingControllers