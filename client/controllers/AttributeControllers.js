const rejectError = require("../../mainUtils/rejectError");
const Attribute = require("../../models/AttributeSchema");
const Product = require("../../models/ProductSchema");

let attributeControllers = {}

attributeControllers.attribute_get_attributes = (req, res) => {
    Product.find({publish: true, userOwner: req.userId}).select("variantsOwner").then(products => {
        let variants = products.flatMap(prod => prod.variantsOwner.flatMap(v => v.option_array)).map(v => {return {_id: v[0], value: v[1]}})
        let filterValues = []
        variants.forEach(v => {
            let variantExists = filterValues.find(va => va._id === v._id)
            if(variantExists) {
                if(variantExists.values.indexOf(v.value) === -1) {
                    filterValues = filterValues.map(va => va._id === v._id ? {...va, values: [...va.values, v.value]} : va)
                }
            } else {
                filterValues.push({
                    _id: v._id,
                    values: [v.value]
                })
            }
        })
        Attribute.find({_id: filterValues.map(a => a._id)}, {public_name: true, type: true}).populate("valuesOwner", ["name"]).then(attributes => {
            let data = filterValues.map(attr => {
                let {_id, public_name,type, valuesOwner} = attributes.find(a => a._id.toString() === attr._id.toString());
                return {
                    _id, 
                    public_name,
                    type,
                    values: valuesOwner.filter(v => attr.values.indexOf(v._id.toString()) !== -1)
                }
            })
            res.status(200).json({data});
        }).catch((err) => rejectError(req , res , err , null, 400))
      }).catch((err) => rejectError(req, res, err, null, 400))
}
module.exports = attributeControllers