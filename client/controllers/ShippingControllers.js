const Shipping = require("../../models/ShippingSchema")
const rejectError = require("../../mainUtils/rejectError")

let shippingControllers = {}

shippingControllers.shipping_getMethods = (req, res) => {
    Shipping.find({userId: req.userId, publish: true}).then(data => {
        res.status(200).json({data})
    }).catch(err =>  rejectError(req, res, err))
}
module.exports = shippingControllers