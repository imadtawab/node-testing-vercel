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
  let reqFilters = req.body.reqFilters
  let specialItems = req.body.specialItems
  if(specialItems) {
    products
    .find({_id: specialItems})
    .then((prdcs => prdcs.sort((a, b) => a.createdAt - b.createdAt).reverse()))
    .then((products) => {
      return res.json({success: true, data: products});
    })
    .catch((err) => console.log(err));
    return
  }
  console.log(specialItems , 987456);
  let filters= {"productStatus.visibility": "true"}
  if(reqFilters?.categorie) filters["categorie._id"] = reqFilters.categorie
  
  if(reqFilters?.attributes){
    let arrAttributes = Object.keys(reqFilters.attributes).filter(key => reqFilters.attributes[key].length !== 0)
    if(arrAttributes.length !== 0) {
    // filters["attributes.attributeId"] = {$in: arrAttributes}
    let arrAttValues = []
    arrAttributes.forEach(key => {
      arrAttValues.push(...reqFilters.attributes[key])
    })
    filters["attributes.attributeValuesId"] = {$in: arrAttValues}
  }
  }
  if(reqFilters?.min || reqFilters?.max) filters["prices.salePrice"] = {}
  if(reqFilters?.min) filters["prices.salePrice"].$gte = reqFilters.min
  if(reqFilters?.max) filters["prices.salePrice"].$lte = reqFilters.max
  console.log(filters,555);
  products
    .find(filters).limit(req.query?.limit ? +req.query.limit : true)
    .then((prdcs => prdcs.sort((a, b) => a.createdAt - b.createdAt).reverse()))
    .then((products) => {
      console.log(reqFilters);
      res.json({success: true, data: products , filters: reqFilters});
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