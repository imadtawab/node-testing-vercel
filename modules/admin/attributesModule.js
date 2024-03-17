// express
const express = require("express");
const attributesModule = express.Router();
const attributes = require("../../models/admin/attribute_schema")
const bcrypt = require("bcrypt")
// multer
const multer = require("multer");
// JWT
const jwt = require("jsonwebtoken")
// fs
const fs  = require("fs");
const categories = require("../../models/admin/category_schema");
const auth = require("../../utils/auth");

// // cors
// const cors = require('cors')
// app.use(cors())

// "/admin/account/attributes"
attributesModule.get("/" , auth, async (req , res) => {
    console.log(req.body,req.params);
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    // console.log(_id , 99999999999999999)
    attributes.find({userId: req.userId}).then((attributes) => {
        console.log("hello attributes ..." ,attributes);
        return res.json({success: true , data: attributes})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To get Attributes"})
    })
})
attributesModule.post("/new" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    new attributes({
        userId: req.userId,
        unique_name: req.body.uniqueName,
        public_name: req.body.name,
        type: req.body.type,
        publish: req.body.publish,
        values: req.body.arrayValues
    }).save().then(newAttr => {
        console.log(newAttr,"********");
        return res.json({success: true, data: newAttr})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Add Attribute"})
    })
})
attributesModule.delete("/delete/:id" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)

    attributes.deleteOne({userId: req.userId , _id: req.params.id}).then(docs => {
        return res.json({success: true , _id: req.params.id})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Delete Attribute"})
    })
})
attributesModule.put("/change-visibility" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    attributes.updateOne({userId: req.userId , _id: req.body.id} , {
        publish : (req.body.visibility == "true" ? "false" : "true")
    }).then(docs => {
        return res.json({success: true , _id:req.body.id , visibility:req.body.visibility})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
    // users.findById(_id).then(async (user) => {
    //     user.attributes = await user.attributes.map(att => {
    //         if(att._id === req.body.id){
    //             console.log(att._id ,req.body.id,963)
    //             att = {
    //                 ...att,
    //                 publish : (req.body.visibility == "true" ? "false" : "true")
    //             }
    //             // att.publish = (req.body.visibility == "true" ? "false" : "true")
    //             // return att
    //         }
    //         return att
    //     })
    //     console.log(user.attributes , 9);
    //     // user.attributes =[]
    //     user.save().then((docs) => {
    //         console.log(docs,10);
    //         return res.json({success: true , data: docs.attributes})
    //     }).catch(err => {
    //         console.log(err)
    //         return res.json({success: false , error: "Failed To Changed Visisblity"})
    //     })
    // }).catch(err => {
    //     console.log(err)
    //     return res.json({success: false , error: "Failed To  Changed Visisblity"})
    // })
})
attributesModule.put("/update/:_id" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    let newAttr = {
        unique_name: req.body.uniqueName,
        public_name: req.body.name,
        type: req.body.type,
        publish: req.body.publish,
        values: req.body.arrayValues
    }
    attributes.updateOne({userId: req.userId , _id: req.params._id}, newAttr).then(docs => {
        // change in product
        
        return res.json({success: true , newAttr , _id: req.params._id})
    }).catch(err => {
        console.log(err)
        return res.json({success: false , error: "Failed To Update Attribute"})
    })
    // users.findById(_id).then(async (user) => {
    //     user.attributes = await user.attributes.map(att => {
    //         if(att._id === req.body._id){
    //             console.log(att._id ,req.body.id,963)
    //             att = req.body
    //             // att.publish = (req.body.visibility == "true" ? "false" : "true")
    //             // return att
    //         }
    //         return att
    //     })
    //     console.log(user.attributes , 9);
    //     // user.attributes =[]
    //     user.save().then((docs) => {
    //         console.log(docs,10);
    //         return res.json({success: true , data: docs.attributes})
    //     }).catch(err => {
    //         console.log(err)
    //         return res.json({success: false , error: "Failed To Update Attribute"})
    //     })
    // }).catch(err => {
    //     console.log(err)
    //     return res.json({success: false , error: "Failed To Update Attribute"})
    // })
})
attributesModule.put("/update-many-status" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    attributes.updateMany({userId: req.userId, _id: req.body.items} , {
        publish: req.body.status
    }).then(docs => {
        return res.json({success: true , items: req.body.items , status: req.body.status})
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
    // users.findById(_id).then(async (user) => {
    //     user.attributes = await user.attributes.map(att => {
    //         if(req.body.items.indexOf(att._id) !== -1){
    //             return {
    //                 ...att,
    //                 publish: req.body.status
    //             }
    //         }
    //         return att
    //     })
    //     user.save().then((docs) => {
            // return res.json({success: true , data: docs.attributes, items: req.body.items})
    //     }).catch(err => {
    //         return res.json({success: false , error: "Failed To Changed Visisblity"})
    //     })
    // }).catch(err => {
    //     return res.json({success: false , error: "Failed To  Changed Visisblity"})
    // })
  })
attributesModule.put("/delete-many-status" , auth, async (req , res) => {
    // const {_id} = await jwt.verify(req.cookies._auth,process.env.JWT_SECRET)
    attributes.deleteMany({userId: req.userId, _id: req.body.items}).then(docs => {
        return res.json({success: true, items: req.body.items})
    }).catch(err => {
        return res.json({success: false , error: "Failed To  Changed Visisblity"})
    })
})

module.exports = attributesModule;