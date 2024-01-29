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
categoriesModule.get("/" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.find({userId: _id}).then((categories) => {
        console.log("hello categories ..." ,categories);
        return res.json({success: true , data: categories})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To get Categories"})
    })
})
categoriesModule.post("/new" , storage.single("image"), async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(_id, 333);
    new categories({
        userId: _id,
        name: req.body.name,
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
})
categoriesModule.delete("/delete/:id/:image" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET) 

    categories.deleteOne({userId: _id, _id: req.params.id}).then(docs => {
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
categoriesModule.put("/change-visibility" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.updateOne({userId:_id , _id:req.body.id} , {
        publish : (req.body.visibility == "true" ? "false" : "true")
    }).then(docs => {
            console.log(docs,10);
            return res.json({success: true , _id:req.body.id , visibility:req.body.visibility})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Changed Visisblity"})
    })
})
categoriesModule.put("/update/:_id/:image" ,storage.single("image"), async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    console.log(req.body , 6666);
    let newCateg = {
        name: req.body.name,
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
    categories.updateOne({userId: _id , _id: req.params._id} , newCateg).then(async docs => {
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
categoriesModule.put("/update-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.updateMany({userId: _id, _id: req.body.items} , {
        publish: req.body.status
    }).then((docs) => {
        return res.json({success: true, items: req.body.items , status: req.body.status})
    }).catch(err => {
        return res.json({success: false , error: "Failed To Changed Visisblity"})
    })
})
categoriesModule.put("/delete-many-status" , async (req , res) => {
    const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    categories.find({userId: _id ,_id: req.body.items}).then(async catg => {
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
        categories.deleteMany({userId: _id, _id: req.body.items}).then(async (docs) => {
            return res.json({success: true, items: req.body.items})
        }).catch(err => {
            return res.json({success: false , error: "Failed To Changed Visisblity"})
        })
    })
})

module.exports = categoriesModule;