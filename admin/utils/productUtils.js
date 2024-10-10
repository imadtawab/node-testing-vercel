let Joi = require('joi');
const rejectError = require("../../mainUtils/rejectError");
const { removeFile } = require('./mediaUtils');


let productUtils = {}
productUtils.validateProductSchema = (req, res, next) => {
  Joi.object({      
      name: Joi.string().min(3).max(100).required(),
      sku:  Joi.any(),
      category: Joi.string().required(),
      originalPrice:  Joi.string().min(0),
      salePrice:  Joi.number().required(),
      discount:  Joi.string().min(0),
      slug:  Joi.string().required(),
      metaTitle:  Joi.string().min(0),
      metaKeywords:  Joi.string().min(0),
      metaDescription:  Joi.string().min(0),
      status: Joi.string().required(),
      publish: Joi.string().required(),
      quantity:  Joi.number(),
      images: Joi.array().min(1),
      description: Joi.string().min(0),
    }).validateAsync(req.body).then(() => next()).catch(err => {
      if(req.files.length) removeFile(req.files.map(file => file.filename))
      rejectError(req, res, err.details[0].message || "Please try again.")
    })
};
productUtils.validateEditProductSchema = (req, res, next) => {
  Joi.object({      
      name: Joi.string().min(3).max(100),
      sku:  Joi.any(),
      category: Joi.string(),
      originalPrice:  Joi.string().min(0),
      salePrice:  Joi.number(),
      discount:  Joi.string().min(0),
      slug:  Joi.string(),
      metaTitle:  Joi.string().min(0),
      metaKeywords:  Joi.string().min(0),
      metaDescription:  Joi.string().min(0),
      status: Joi.string(),
      publish: Joi.string(),
      quantity:  Joi.number(),
      images: Joi.array(),
      imagesForDelete: Joi.string(),
      imagesPosition: Joi.string(),
      description: Joi.string().min(0),
    }).validateAsync(req.body).then(() => next()).catch(err => {
      if(req.files.length) removeFile(req.files.map(file => file.filename))
        rejectError(req, res, err.details[0].message || "Please try again.")
    })
};
productUtils.productBodyHanlder = (req) => {
  let {
      name,
      sku,
      category,
      originalPrice,
      salePrice,
      discount,
      metaTitle,
      metaKeywords,
      metaDescription,
      status,
      publish,
      quantity,
      description,
    } = req.body
  return {
      userOwner: req.userId,
      categoryOwner: category,
      name,
      sku,
      slug: req.slugify,
      description,
      prices: {
        originalPrice: +originalPrice,
        salePrice: +salePrice,
        discount: +discount,
      },
      media: {
        images: req.files.map(file => file.filename),
      },
      searchEngineOptimize: {
        metaTitle,
        metaKeywords,
        metaDescription,
      },
      status: +status,
      publish: +publish,
      quantity
    }
}
productUtils.productEditBodyHanlder = (req, body={}) => {
  let {name, sku, category, originalPrice, salePrice, discount, metaTitle, metaKeywords, metaDescription, status, publish, quantity, description} = req.body

    if(category) body.categoryOwner = category
    if(name) body.name = name
    if(sku) body.sku = sku
    if(req.slugify) body.slug = req.slugify
    if(description) body.description = description
    // prices
    if(originalPrice) body["prices.originalPrice"] = +originalPrice
    if(salePrice) body["prices.salePrice"] = +salePrice
    if(discount) body["prices.discount"] = +discount
    // searchEngineOptimize
    if(metaTitle) body["searchEngineOptimize.metaTitle"] = metaTitle
    if(metaKeywords) body["searchEngineOptimize.metaKeywords"] = metaKeywords
    if(metaDescription) body["searchEngineOptimize.metaDescription"] = metaDescription

    if(status) body.status = +status
    if(publish) body.publish = +publish
    if(quantity) body.quantity = +quantity

  return body
      // media: {
      //   images: req.files.map(file => file.filename),
      // },
}

  module.exports = productUtils