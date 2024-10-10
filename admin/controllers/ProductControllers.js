let Product = require('../../models/ProductSchema')
let Attribute = require('../../models/AttributeSchema')
const { removeFile } = require('../utils/mediaUtils')
const paginationHandler = require('../utils/paginationUtils')
const { productBodyHanlder, productEditBodyHanlder } = require('../utils/productUtils')
let rejectError = require('../../mainUtils/rejectError')
const Variant = require('../../models/VariantsSchema')
const Category = require('../../models/CategorySchema')
let productControllers = {}

productControllers.product_get_products = (req, res) => {
    let {page, step, search, category, status, publish, from, to} = req.query

    let filters = {userOwner: req.userId}
    if(search) filters.name = {"$regex" : new RegExp(`.*${search}.*`, 'i')}
    if(status) filters.status = status
    if(publish) filters.publish = publish
    if(category) filters.categoryOwner = category
    if(from || req.query.to) {
        filters.createdAt = {}
        if(from) filters.createdAt["$gte"] = new Date(from).getTime()
        if(to) filters.createdAt["$lte"] = new Date(to).setHours(23, 59, 59, 999)
    }
    Product.find(filters).populate("categoryOwner", ["name"]).then(data => {
        res.status(200).json({...paginationHandler(data, {page, step}), query: req.query})
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_post_newProduct = (req, res) => {
  let body = productBodyHanlder(req, req.slugify, req.files.map(file => file.filename))
    new Product(body).save().then(({_id}) => {
            res.status(200).json({message: "Product has been created successfully.", _id});
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_post_variants = (req, res) => {
    Product.findOneAndUpdate({_id: req.params.id, userOwner: req.userId}, {options: req.body.options, variantsOwner: req.body.variants}).then(product => {
        // Variant.insertMany(req.body.variants).then(variants => {
        //     let variantsOwner = variants.map(v => v._id)
        //     product.variantsOwner = variantsOwner
        //     product.save()
        // })
        res.status(200).json({message: "For testing"})
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_get_attributesForVariants = (req, res) => {
    Product.findOne({userOwner: req.userId, _id: req.params.id})
    // .populate("attributes.attributeOwner", ["unique_name", "public_name", "valuesOwner"])
    // .populate("attributes.attributeOwner.valuesOwner", ["name", "color"])
    .populate({
        path: 'options.attributeOwner', // populate the attributeOwner field
        populate: {
          path: 'valuesOwner', // nested populate for valuesOwner within attributeOwner
          model: 'attribute_value' // specify the model to populate
        }
      })
      .populate("variantsOwner")
    .then(prod => {
        Attribute.find({publish: true}).populate("valuesOwner", ["name", "color"]).then(attributes => {
            let product = prod.toObject()
            product.options = product.options.map(attr => {
                let basicValues = attr.values
                let {_id, unique_name, public_name, valuesOwner} = attr.attributeOwner
                return {
                    _id,
                    unique_name,
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
            // console.log(product,"aaaaaaa");
            res.status(200).json({data: {product, attributes}});
        }).catch(err => rejectError(req, res, err))
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_post_checkSlug = (req, res) => {
    Product.findOne({userOwner: req.userId, slug: req.slugify}).then(isExist => {
        if(isExist) {
            if(isExist._id.toString() === req.body?.id) return res.status(200).json({message: `This is current slug. "${req.slugify}"`, checked: true, current: true})
            res.status(200).json({message: `Slug already exists. "${req.slugify}"`, checked: false})
        } else {
            res.status(200).json({message: `Slug is available. "${req.slugify}"`, checked: true})
        }
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_delete_product = (req, res) => {
    Product.findByIdAndDelete({userOwner: req.userId, _id: req.params.id}).then(prod => {
            removeFile(prod.media?.images);
            res.status(200).json({message: "The product has been deleted."});
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_patch_visibility = (req, res) => {
    Product.updateOne({userOwner: req.userId, _id: req.params.id}, {publish: !req.body.publish}).then(() => {
        res.status(200).json({message: "The visibility has been updated."})
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_update_manyProductsVisibility = (req, res) => {
    Product.updateMany({userOwner: req.userId, _id: req.body.itemsSelected}, {publish: req.body.publish}).then((docs) => {
                res.status(200).json({message: `${req.body.itemsSelected.length} products has been changed to ${req.body.publish ? "publish" : "not publish"}.`})
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_delete_manyProducts = async (req, res) => {
    let products = await Product.find({userOwner: req.userId, _id: req.body.itemsSelected})
    Product.deleteMany({userOwner: req.userId, _id: req.body.itemsSelected}).then(async (docs) => {
        await removeFile(products.map(prod => prod.media.images).flat())
        res.status(200).json({message: `${docs.deletedCount} attributes has been deleted.`})
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_get_product = (req, res) => {
    Product.findOne({userOwner: req.userId, _id: req.params.id}).then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err))
}
productControllers.product_post_editProduct = async (req, res) => {
    let updates = productEditBodyHanlder(req)

    let imagesPosition = await JSON.parse(req.body.imagesPosition)

    let images = []
    let currentInd = 0
    await imagesPosition.forEach(async img => {
        if(img) {
            return images.push(img)
        }
        images.push(req.files[currentInd].filename)
        return currentInd += 1

    });
    updates["media.images"] = images;
    Product.updateOne({userOwner: req.userId, _id: req.params.id}, updates)
    .then(async () => {
        let imagesForDelete = req.body.imagesForDelete ? JSON.parse(req.body.imagesForDelete) : null
        if(imagesForDelete) await removeFile(imagesForDelete)
        res.status(200).json({message: "The Product has been updated."})
    }).catch(err => rejectError(req, res, err))
}
module.exports = productControllers