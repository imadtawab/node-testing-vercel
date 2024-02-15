// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const attributes = require("../../models/admin/attribute_schema")
const rejectError = require("../../utils/rejectError")
const productsModule = express.Router();
const fs  = require("fs")
const jwt = require("jsonwebtoken")

// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");

// '/client/products'
const auth = (req,res,next) => {
  // jwt.verify(req.cookies.token, process.env.JWT_SECRET , (err, decoded) => {
  //   if(err){
  //     console.log(err);
  //     res.json({success: false, message: err})
  //     return
  //   }
  //   console.log(decoded,693) // bar
  // })
  next()
}
productsModule.post("/", auth , (req, res) => {
  console.log(req.body,88);
  let filters= {"productStatus.visibility": "true"}
  if(req.body?.categorie) filters["categorie._id"] = req.body.categorie
  
  if(req.body?.attributes){
    let arrAttributes = Object.keys(req.body.attributes).filter(key => req.body.attributes[key].length !== 0)
    if(arrAttributes.length !== 0) {
    // filters["attributes.attributeId"] = {$in: arrAttributes}
    let arrAttValues = []
    arrAttributes.forEach(key => {
      arrAttValues.push(...req.body.attributes[key])
    })
    filters["attributes.attributeValuesId"] = {$in: arrAttValues}
  }
  }
  if(req.body?.min || req.body?.max) filters["prices.salePrice"] = {}
  if(req.body?.min) filters["prices.salePrice"].$gte = req.body.min
  if(req.body?.max) filters["prices.salePrice"].$lte = req.body.max
  console.log(filters,555);
  products
    .find(filters).limit(req.query?.limit ? +req.query.limit : true)
    .then((products) => {
      res.json({success: true, data: products});
    })
    .catch((err) => console.log(err));
});
productsModule.get("/:urlKey", auth , (req, res) => {
  console.log(req.params.urlKey , "aaaaaaaaa");
  products
    .findOne({"searchEngineOptimize.urlKey": req.params.urlKey})
    .then(async (product) => {
      if(!product){
        res.json({success: false , error: "This product is not available"})
      }
      attributes.find({userId: product?.userId}).then((attributes) => {
        res.json({product, attributes , success: true});
    }).catch(err => console.log(err))
    })
    .catch((err) => console.log(err));
});
module.exports = productsModule;