// express
const express = require("express");
const categoriesModule = express.Router();
const categories = require("../../models/admin/category_schema")
// multer
const multer = require("multer");
// JWT
const jwt = require("jsonwebtoken")
// fs
const fs  = require("fs");
const products = require("../../models/admin/product_schema");
// reject errors
const rejectError = require("../../utils/rejectError");
const auth = require("../../utils/auth");

// "/admin/account/categories"

// #####################
const storage = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        console.log(file,5);
        cb(null, `${Date.now()}_${file.originalname.replace("+","")}`);
    },
}),
});
categoriesModule.get("/" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.find({userId: req.userId}).then((categories) => {
        console.log("hello categories ..." ,categories);
        return res.json({success: true , data: categories})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To get Categories"})
    })
})
categoriesModule.post("/new" , auth, storage.single("image"), async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    // console.log(_id, 333);
    categories.findOne({userId : req.userId , slug: req.body.slug.trim().split(" ").join("-")}).then(existSlug => {
        new categories({
            userId: req.userId,
            name: req.body.name,
            slug: existSlug ? (req.body.slug.trim().split(" ").join("-") + "-" + new Date().getTime()) : req.body.slug.trim().split(" ").join("-"),
            description: req.body.description,
            publish: req.body.publish,
            image: req?.file ? req?.file.filename : ""
        }).save().then((newCateg => {
            console.log(newCateg,"**********");
            return res.json({success: true, data: newCateg})
        })).catch(err => {
            console.log(err)
            return res.json({success: false , error: "Failed To Add Categorie"})
        })
    }).catch(err => rejectError(req , res , err , null))
})
categoriesModule.delete("/delete/:id/:image" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET) 

    categories.deleteOne({userId: req.userId, _id: req.params.id}).then(docs => {
        console.log(docs, 666666);
        if(req.params.image !== "undefined"){
            const path = `./public/uploads/${req.params.image}`
            console.log(path,55);
                fs.unlink(path,(err) => {
                if (err) {
                    console.log(err,"not deleted ???")
                } else {
                    console.log("deleted....");
        
                }
            })

        }
        return res.json({success: true , _id: req.params.id})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Delete Categorie"})
    })
})
categoriesModule.put("/change-visibility" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.updateOne({userId:req.userId , _id:req.body.id} , {
        publish : (req.body.visibility == "true" ? "false" : "true")
    }).then(docs => {
            console.log(docs,10);
            return res.json({success: true , _id:req.body.id , visibility:req.body.visibility})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Changed Visisblity"})
    })
})
categoriesModule.put("/update/:_id/:image" , auth,storage.single("image"), async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(req.body , 6666);
    categories.findOne({slug: req.body.slug.trim().split(" ").join("-")}).then(async existSlug => {
        function checkIfKeyExists(key) {
            if(key) {
              if(key._id.toString() === req.params.id){
                console.log(1);
                return key.slug.trim()
              }else{
                console.log(2);
                return key.slug.trim() + "-" + new Date().getTime()
              }
            } else{
              console.log(3);
              return req.body.slug.split(" ").join("-")
            }
        }
        let newCateg = {
            name: req.body.name,
            slug: await checkIfKeyExists(existSlug),
            description: req.body.description, 
            publish: req.body.publish,
        }
        // image: req?.file ? req?.file.filename : !req.body.delete ? att.image : ""
        if(req?.file){
            newCateg.image = req?.file.filename
    
        }else{
            if(req.body.delete){
                newCateg.image = ""
            }
        }
        categories.updateOne({userId: req.userId , _id: req.params._id} , newCateg).then(async docs => {
            console.log(docs,10);
            if((req?.file?.filename || req.body.delete) && req.params.image !== "undefined"){
                const path = `./public/uploads/${req.params.image}`
                console.log(path,55);
                    fs.unlink(path,(err) => {
                    if (err) {
                        console.log(err,"not deleted ???")
                    } else {
                        console.log("deleted....");
            
                    }
                })
            }
            categories.findById(req.params._id).then(catg => {
                products.updateMany({"categorie._id": req.params._id}, {
                    "categorie": catg
                }).then(ok => {
                    return res.json({success: true , newCateg , _id: req.params._id})
                }).catch(err => {
                console.log(err,11)
                return res.json({success: false , error: "Failed To Update Categorie"})
                })
            })
    
        }).catch(err => {
            console.log(err,11)
            return res.json({success: false , error: "Failed To Update Categorie"})
        })
    })
})
categoriesModule.put("/update-many-status" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.updateMany({userId: req.userId, _id: req.body.items} , {
        publish: req.body.status
    }).then((docs) => {
        return res.json({success: true, items: req.body.items , status: req.body.status})
    }).catch(err => {
        return res.json({success: false , error: "Failed To Changed Visisblity"})
    })
})
categoriesModule.put("/delete-many-status" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.find({userId: req.userId ,_id: req.body.items}).then(async catg => {
        let pathNames = await catg.map(c => c.image ? `./public/uploads/${c.image}` : "")
        console.log(pathNames);
        await pathNames.forEach(path => {
            console.log(path,55);
               if(path) {
                fs.unlink(path,(err) => {
                    if (err) {
                        console.log(err,"not deleted ???")
                    } else {
                        console.log("deleted....");
            
                    }
                })
               }

        })
        categories.deleteMany({userId: req.userId, _id: req.body.items}).then(async (docs) => {
            return res.json({success: true, items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    })
})
categoriesModule.post("/check-slug" , auth, async (req, res) => {
//     try {
//       await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
//   } catch (error) {
//       console.log(error , "error authentication 11 ....");
//       return res.json({success: false , error: "Authorization is not valid"})
//   }
//   const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    console.log(req.body);
    if(req.body.slug.trim().split(" ").join("-") === ""){
      return res.json({success: true , data: {checking: false , message: "Slug must not be blank"}})
    }
    categories.findOne({userId : req.userId , slug: req.body.slug.trim().split(" ").join("-")}).then(existSlug => {
      // console.log(existKey);
      if(existSlug){
        if(req.body._id){
          if(req.body?._id.toString() === existSlug._id.toString()){
            return res.json({success: true , data: {checking: true , message: "This is the current value."}})
          }
        }
        return res.json({success: true , data: {checking: false , message: "The products slug already exists."}})
      }
      console.log("object");
      return res.json({success: true , data: {checking: true , message: "Slug is available."}})
    }).catch(err => rejectError(req , res , err , null));
  })
module.exports = categoriesModule;