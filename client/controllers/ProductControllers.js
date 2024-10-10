const rejectError = require("../../mainUtils/rejectError");
const Product = require("../../models/ProductSchema");

let productControllers = {}

productControllers.product_get_products = (req, res) => {
    let {categories, min, max, attributes} = req.query
    let filters = {publish: true, userOwner: req.userId}
    
    if(categories) filters.categoryOwner = {
        $in: categories.split(",")
    }
    if (min || max) {
        const priceFilter = {};
        if (min) priceFilter.$gte = +min;
        if (max) priceFilter.$lte = +max;
        filters.$or = [
            { "prices.salePrice": priceFilter },
            { "prices.originalPrice": priceFilter }
        ];
    }
    if(attributes) filters["variantsOwner.option_array"] = {
        $elemMatch: {
            $elemMatch: { $in: attributes.split(",") }
          }
    }
    Product.find(filters)
    .populate("categoryOwner", ["name"])
    .then( products => {
//         Product.aggregate([
//   {
//     $group: {
//       _id: null,
//       maxSalePrice: { $max: "$prices.salePrice" },  // Get the maximum salePrice
//       minSalePrice: { $min: "$prices.salePrice" }   // Get the minimum salePrice
//     }
//   }
// ])
        res.status(200).json({data: products, query: req.query});
    }).catch((err) => rejectError(req, res, err))
}
productControllers.product_get_wishList = (req, res) => {
    Product.find({publish: true, _id: req.body.wishlist, userOwner: req.userId})
    .populate("categoryOwner", ["name"])
    .then( products => {
        res.status(200).json({data: products});
    }).catch((err) => rejectError(req, res, err, null, 400))
}
productControllers.product_get_product = (req, res) => {
    Product.findOne({slug: req.params.slug, userOwner: req.userId})
    .populate('categoryOwner', ["name"])
    .populate({
        path: 'options.attributeOwner', // populate the attributeOwner field
        populate: {
          path: 'valuesOwner', // nested populate for valuesOwner within attributeOwner
          model: 'attribute_value' // specify the model to populate
        }
      })
    .populate("variantsOwner")
      .then( prod => {
        let product = prod.toObject();
        product.options = product.options.map(attr => {
            let basicValues = attr.values
            let {_id, public_name, valuesOwner, type} = attr.attributeOwner
            return {
                _id,
                type,
                public_name,
                values: valuesOwner.filter(v => basicValues.indexOf(v._id.toString()) !== -1)
            }
        })
        product.variantsOwner = product.variantsOwner.map(v => {
            let name = []
            v.option_array.forEach(o => {
                return name.push(product.options.find(opt => opt._id.toString() === o[0]).values.find(val => val._id.toString() === o[1]).name)
            })
            return {
                ...v,
                name: name.join(" - ")
            }
        })
        res.status(200).json({data: product});
    }).catch((err) => rejectError(req, res, err, null, 400))
}
module.exports = productControllers