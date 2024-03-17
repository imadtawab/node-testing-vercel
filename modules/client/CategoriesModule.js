// express
const express = require("express");
const categories = require("../../models/admin/category_schema");
const products = require("../../models/admin/product_schema");
const categoriesModule = express.Router();
// rejectError
const rejectError = require("../../utils/rejectError")
// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");

// /client/categories
categoriesModule.get("/" , (req, res) => {
  products.find({"productStatus.visibility": "true"}).then(async products => {
    // {_id: products.map(p => p.categorie._id)} , {_id:true, userId:true, name:true, description:true, image:true, slug:true}
    categories.find({_id: products.map(p => p.categorie._id)} , {_id:true, userId:true, name:true, description:true, image:true, slug:true}).then(catgs => {
      // res.json(catgs)
      // return
    let findCategories = catgs.map(c => {
      const {_id, userId, name, description, image, slug} = c
      return {_id, userId, name, description, image, slug , number: 1}
    })
    let allCategories = []
    products.map(p => p.categorie).map(category => {
      return findCategories.find(c => c._id.toString() === category._id.toString())
    }).forEach((current , i) => {
      let exist = allCategories.filter(category => category._id.toString() === current._id.toString())[0]
      if(exist){
        allCategories = allCategories.map(category => {
          if (category._id.toString() === current._id.toString()) {
            console.log("exist and equal this");
            return {
              ...category,
              number: category.number + 1
            }
          }
          return category
        })
      }else{
        allCategories.push(current)
      }
    })
    res.json({success:true , data: allCategories});
  }).catch((err) => rejectError(req , res , err , null))
  }).catch((err) => rejectError(req , res , err , null))
});
module.exports = categoriesModule;
