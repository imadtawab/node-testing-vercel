const rejectError = require("../../mainUtils/rejectError");
const Category = require("../../models/CategorySchema");
const Product = require("../../models/ProductSchema");

let categoryControllers = {}

categoryControllers.category_get_categories = (req, res) => {
    Product.find({publish: true, userOwner: req.userId}).select("categoryOwner").then(async products => {
        Category.find({_id: products.map(p => p.categoryOwner)} , {_id:true, userOwner:true, name:true, description:true, image:true, slug:true}).then(catgs => {
            let categoriesHandler = catgs.map(c => {
                let prodArray = products.filter(prod => prod.categoryOwner.toString() === c._id.toString())
            return {...c.toObject() , number: prodArray.length}
        })
        res.status(200).json({data: categoriesHandler});
      }).catch((err) => rejectError(req , res , err , null, 400))
      }).catch((err) => rejectError(req, res, err, null, 400))
}
module.exports = categoryControllers