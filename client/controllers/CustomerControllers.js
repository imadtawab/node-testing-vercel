const rejectError = require("../../mainUtils/rejectError");
const Order = require("../../models/OrderSchema");
const Product = require("../../models/ProductSchema");
const Visitor = require("../../models/VisitorSchema");
const Shipping = require("../../models/ShippingSchema");
const jwt = require("jsonwebtoken");
const Coupon = require("../../models/CouponSchema");


let customerControllers = {}

customerControllers.customer_post_placeOrder = async (req, res) => {
  let {customer, shoppingCart, shippingMethod, coupon} = req.body
  try {
    let shipping = await Shipping.findById(shippingMethod?._id).select(["cost", "name", "estimated_delivery", "rangeAmount"])
    if(shipping) {
      shippingMethod = shipping
    }
  } catch (err) {
    return rejectError(req, res, err)
  }
  try {
    let couponExist = await Coupon.findById(coupon?._id).select(["code", "type", "discount", "description", "expirationDate"])
    if(couponExist) {
      coupon = couponExist
    }
  } catch (err) {
    return rejectError(req, res, err)
  }
    // return rejectError(req, res, null, "tesetee")
    let products_id = shoppingCart.map(prod => prod._id)
    // shoppingCart: [
    //     {
    //         productOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    //         total_price: Number,
    //         total_quantity: Number,
    //         variants: [{
    //             _id: String,
    //             name: String,
    //             image: String,
    //             sku: String,
    //             price: Number,
    //             quantity: Number
    //         }]
    //     }
    //   ],
    Product.find({_id: products_id, userOwner: req.userId})
    .populate("categoryOwner", ["name"])
    .populate({
        path: 'options.attributeOwner', // populate the attributeOwner field
        populate: {
          path: 'valuesOwner', // nested populate for valuesOwner within attributeOwner
          model: 'attribute_value' // specify the model to populate
        }
    })
    .then(products => {
        let shoppingCartHandle = shoppingCart.map((prod) => {
            let product = products.find((p) => p._id.toString() === prod._id);
            let variants_array = prod.variants.filter((v) => v._id.toString() !== product._id.toString());
            if(!variants_array.length) {
              return {
                  _id: prod._id,
                  name: product.name,
                  image: product.media.images[0],
                  category: {
                    name: product.categoryOwner.name,
                    _id: product.categoryOwner._id,
                  },
                  variants: [
                      {   
                          _id: product._id,
                          image: product.media.images[0],
                          sku: product.sku,
                          price: +product.prices.salePrice,
                          quantity: prod.variants[0].quantityUser
                      }
                  ]
              }
            }
          
            return {
                _id: prod._id,
                name: product.name,
                image: product.media.images[0],
                category: {
                    name: product.categoryOwner.name,
                    _id: product.categoryOwner._id,
                },
                variants: variants_array.map((v) => {
                  // Handle name
                  product.optionsHanlde = product.options.map(attr => {
                      let basicValues = attr.values
                      let {_id, valuesOwner} = attr.attributeOwner
                      return {
                          _id,
                          values: valuesOwner.filter(v => basicValues.indexOf(v._id.toString()) !== -1)
                      }
                  })
                let { image, sku, prices, option_array } = product.variantsOwner.find((va) => va._id === v._id);
                let name = option_array.map(o => {
                  return product.optionsHanlde.find(opt => opt._id.toString() === o[0]).values.find(val => val._id.toString() === o[1]).name
                }).join(" - ");
              //   Handle name
                return {
                  _id: v._id,
                  image,
                  sku,
                  price: +prices.salePrice,
                  name,
                  quantity: v.quantityUser
                };
              }),
            };
          }).map(prod => {
              return {
                  ...prod,
                  total_quantity: prod.variants.map(v => v.quantity).reduce((a,b) => a + b),
                  total_price: prod.variants.map(v => v.quantity * v.price).reduce((a,b) => a + b)
              }
          });
          let total_quantity = shoppingCartHandle.map(prod => prod.total_quantity).reduce((a,b) => a + b)
          let subtotal = shoppingCartHandle.map(prod => prod.total_price).reduce((a,b) => a + b)
          let shippingCost = shippingMethod.rangeAmount?.min_amount ? (
            subtotal >= shippingMethod.rangeAmount?.min_amount ? shippingMethod.rangeAmount?.cost : shippingMethod.cost
            ) : (
                shippingMethod.cost
            )
          let body = {
            userId: req.userId,
            shoppingCart: shoppingCartHandle,
            ...customer,
            total_quantity,
            shippingMethod,
            shippingCost,
            subtotal,
            total_price: ((coupon?.discount ? coupon.type === "fixed" ? subtotal - coupon.discount : +subtotal*(1 - (+coupon.discount/100)) : subtotal) + +shippingCost).toFixed(2),
        }
        if(coupon?.discount) body.coupon = coupon
        new Order(body).save().then(order => {
            res.status(200).json({message: "Your order has been successfully."})
        }).catch(err => rejectError(req, res, err))
    })
}
customerControllers.customer_post_countVisitors = async (req, res) => {
  let visitorId = req.body?.xidvstrs;

  if (!visitorId) {
      Visitor.findOne({userId: req.userId}).then(async (visitor) => {
          let currentDate = new Date().getTime()
          try {
            const token = await jwt.sign({userId: req.userId},process.env.VISITORS_KEY,{expiresIn:"1d"})
            if(visitor) {
              visitor.visits.push(currentDate);
              visitor.save().then((e) => {
                  return res.status(200).json({cookie: token})
              }).catch(err => rejectError(req, res , err))
          } else {
              new Visitor({
                  userId: req.userId,
                  visits: [currentDate]
              }).save().then((e) => {
                  return res.status(200).json({cookie: token})
              }).catch(err => rejectError(req, res , err))
          }
          } catch (err) {
            rejectError(req, res , err)
          }
      }).catch(err => rejectError(req, res , err))
      }else{
          return res.status(200).json({cookie: null})
      }
   
}
module.exports = customerControllers