// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const attributes = require("../../models/admin/attribute_schema");
const productsModule = express.Router();
const fs  = require("fs")
const jwt = require("jsonwebtoken")

// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");
const { Collection } = require("mongoose");

// '/admin/products'
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
productsModule.get("/", auth , async (req, res) => {
  // console.log(req.query,111);
  try {
      await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
  } catch (error) {
      console.log(error , "error authentication 5 ....");
      return res.json({success: false , error: "Authorization is not valid"})
  }
  const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
  // console.log(_id , "success authentication 5 ....");

  let filters = {userId: _id}
  if(req.query.search) filters["name"] = {"$regex" : new RegExp(`.*${req.query.search}.*`, 'i')}
  if(req.query.status) filters["productStatus.status"] = req.query.status
  if(req.query.visibility) filters["productStatus.visibility"] = req.query.visibility
  if(req.query.category) filters["categorie._id"] = req.query.category
  if(req.query.from || req.query.to) filters.createdAt = {}
  if(req.query.from) filters.createdAt["$gte"] = req.query.from
  if(req.query.to) filters.createdAt["$lte"] = new Date(req.query.to).setHours(24 , 60 , 60 , 60)
  
  console.log("filters : " , filters);
  products
    .find({...filters})
    .then((prdcs => prdcs.sort((a, b) => a.createdAt - b.createdAt).reverse()))
    .then((prdcs) => {
      if (req.query.count && req.query.step && req.query.step !== "all") {
        console.log(req.query);
        let start = +req.query.step * (+req.query.count - 1)
        let end = (+req.query.step * (+req.query.count - 1)) + +req.query.step

        const numberOfItems = Math.ceil(prdcs.length / req.query.step)
 
        res.json({
            success: true,
            pagination: {
                step: req.query.step,
                numberOfItems,
                currentPagination: req.query.count
            },
            filterValues: {
                status: req.query.status || null,
                visibility: req.query.visibility || null,
                category: req.query.category || null,
                from: req.query.from || null,
                to: req.query.to || null,
                search: req.query.search || null,
            },
            sub_data: {
                numberTotal: prdcs.length
            },
            data: prdcs.filter((o,i) => i >= start && i < end)
        })
        // console.log(start , end , 222222222)
}else{
    // console.log(prdcs , 3333333333)

    res.json({success: true, 
        sub_data: {
            numberTotal: prdcs.length
        },
         data: prdcs,
          pagination: {
                step: "all",
                numberOfItems: 1,
                currentPagination: 1
            },
            filterValues: {
                status: req.query.status || null,
                category: req.query.category || null,
                from: req.query.from || null,
                to: req.query.to || null,
                search: req.query.search || null,
            },
        })
}
    })
    .catch((err) => console.log(err));
});
productsModule.get("/:id", auth , (req, res) => {
  // res.send("all products");
  products
    .findById({_id: req.params.id})
    .then(async (product) => {
      attributes.find({userId: product.userId}).then((attributes) => {
        res.json({product, attributes});
    }).catch(err => console.log(err))
    })
    .catch((err) => console.log(err));
});
const storage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname.replace("+","")}`);
    },
  }),
});
productsModule.post("/new-product", auth , storage.array("images"), async (req, res) => {
  try {
    await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
} catch (error) {
    console.log(error , "error authentication 11 ....");
    return res.json({success: false , error: "Authorization is not valid"})
}
const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
console.log(req.body.urlKey.split(" ").join("-") , "boooooddddddddddyyyyyyy");
const {
  name,
  sku,
  categorie,
  description,
  originalPrice,
  salePrice,
  discount,
  urlKey,
  metaTitle,
  metaKeywords,
  metaDescription,
  status,
  visibility,
  quantite,
} = req.body;

  products.findOne({userId : _id , "searchEngineOptimize.urlKey": req.body.urlKey.trim().split(" ").join("-")}).then(existKey => {
    console.log(existKey);
    // return res.json({success: false , error: "wak wak"})

    new products({
      name,
      sku,
      categorie: JSON.parse(categorie),
      description,
      prices: {
        originalPrice: +originalPrice,
        salePrice: +salePrice,
        discount: +discount,
      },
      media: {
        images: req.files.map((file) => file.filename),
      },
      searchEngineOptimize: {
        urlKey: existKey ? (req.body.urlKey.trim().split(" ").join("-") + "-" + new Date().getTime()) : req.body.urlKey.trim().split(" ").join("-"),
        metaTitle,
        metaKeywords,
        metaDescription,
      },
      productStatus: {
        status,
        visibility,
      },
      quantite,
      variants: [],
      userId: _id
    })
      .save()
      .then((docs) => {
        res.json({success:true , data:docs});
      })
      .catch((err) => console.log(err, 5));
  })

});
productsModule.post("/check-url-key" , auth , async (req, res) => {
  try {
    await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
} catch (error) {
    console.log(error , "error authentication 11 ....");
    return res.json({success: false , error: "Authorization is not valid"})
}
const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
  console.log(req.body);
  if(req.body.urlKey.trim().split(" ").join("-") === ""){
    return res.json({success: true , data: {checking: false , message: "Slug must not be blank"}})
  }
  products.findOne({userId : _id , "searchEngineOptimize.urlKey": req.body.urlKey.trim().split(" ").join("-")}).then(existKey => {
    // console.log(existKey);
    if(existKey){
      if(req.body._id){
        if(req.body?._id.toString() === existKey._id.toString()){
          return res.json({success: true , data: {checking: true , message: "This is the current value."}})
        }
      }
      return res.json({success: true , data: {checking: false , message: "The products slug already exists."}})
    }
    console.log("object");
    return res.json({success: true , data: {checking: true , message: "Slug is available."}})
  }).catch(err => console.log(err));
})
productsModule.delete("/delete/:id", auth , (req, res) => {
  products.findById({_id: req.params.id}).then(prod => {
    products
    .deleteOne({ _id: req.params.id })
    .then((docs) => {
      const pathImages = prod.media.images.map(img => `./public/uploads/${img}`)
      console.log(pathImages,55);
      // const path = "./public/uploads/" + req.body.oldStoreLogo
      pathImages.forEach(path => {
        fs.unlink(path,(err) => {
          if (err) {
              console.log(err,"not deleted ???")
          } else {
            console.log("deleted....");

          }
      })
      })
      res.json(req.params.id);
    })
    .catch((err) => console.log(err));
  }).catch(err => console.log(err))
});

productsModule.patch( "/editProduct/:id", auth ,storage.array("images"),async (req, res) => {
  // console.log(req.query,"#####",req.body);
  
  const prodDB = await products.findById(req.params.id)
    const {
      name,
      sku,
      categorie,
      description,
      originalPrice,
      salePrice,
      discount,
      urlKey,
      metaTitle,
      metaKeywords,
      metaDescription,
      status,
      visibility,
      quantite
    } = req.body;

    const oldImages = req.query.oldImages.filter((img) => img !== "undefined");
    // console.log(req.body.urlKey.split(" ").join("-"));
    products.findOne({"searchEngineOptimize.urlKey": req.body.urlKey.trim().split(" ").join("-")}).then(async existKey => {
      function checkIfKeyExists(key) {
        if(key) {
          if(key._id.toString() === req.params.id){
            console.log(1);
            return key.searchEngineOptimize.urlKey.trim()
          }else{
            console.log(2);
            return key.searchEngineOptimize.urlKey.trim() + "-" + new Date().getTime()
          }
        } else{
          console.log(3);
          return req.body.urlKey.split(" ").join("-")
        }
      }
      console.log(checkIfKeyExists(existKey) , "------> test 1");
      const prodEdited = {
        name,
        sku,
        categorie: JSON.parse(categorie),
        description,
        prices: {
          originalPrice: +originalPrice,
          salePrice: +salePrice,
          discount: +discount,
        },
        media: {
          images: [...oldImages, ...req.files.map((file) => file.filename)],
        },
        searchEngineOptimize: {
          urlKey: await checkIfKeyExists(existKey),
          metaTitle,
          metaKeywords,
          metaDescription,
        },
        productStatus: {
          status,
          visibility,
        },
        quantite,
        variants: prodDB.variants
      }
      
      products
        .updateOne(
          { _id: req.params.id },
          prodEdited
        )
        .then((docs) => {
          console.log(oldImages,req.query.allImages,9899);
  
          const imagesForDelete = req.query.allImages.filter(img => oldImages.indexOf(img) === -1)
          const pathImages = imagesForDelete.map(img => `./public/uploads/${img}`)
          console.log(pathImages,55);
          // const path = "./public/uploads/" + req.body.oldStoreLogo
          pathImages.forEach(path => {
            fs.unlink(path,(err) => {
              if (err) {
                  console.log(err,"not deleted ???")
              } else {
                console.log("deleted....");
  
              }
          })
          })
          res.json({_id: req.params.id,...prodEdited , success: true , data: {_id: req.params.id,...prodEdited}});
        })
        .catch((err) => console.log(err));
    })

  }
);
productsModule.put("/change-visibility", auth , async (req, res) => {
  console.log(req.body.id, req.body.visibility, 9963);
  const prod =  await products.findById(req.body.id)
  console.log(prod,8888);
  prod.productStatus = {
    status: prod.productStatus.status,
    visibility: req.body.visibility == "true" ? "false" : "true"
  }
  console.log(prod,9998);

      products.updateOne({_id:req.body.id},prod
        )
        .then((docs) => {
          console.log(docs,5555);
          res.json(prod);
        })
        .catch((err) => console.log(err,99999999999));
  console.log("######################################################");
  // return

  // products.findOne({_id: req.body.id}).then(async (prod) => {
  //   prod.productStatus.visibility = (req.body.visibility == "true" ? "false" : "true")
  //   await prod.save().then((p) => {
  //     console.log("success", p, 333333333);
  //     res.json(prod);
  //   }).catch((err) => console.log(err))
  // }).catch((err) => console.log(err))
  // console.log(prod,8888);
  // prod.productStatus.visibility = (req.body.visibility == "true" ? "false" : "true")
  // console.log(prod,9998);

  //     products.updateOne({_id:req.body.id},prod
  //       )
  //       .then((docs) => {
  //         console.log(docs,5555);
  //         res.json(prod);
  //       })
  //       .catch((err) => console.log(err,99999999999));
});
productsModule.put("/add-variants", auth , async (req, res) => {
  console.log(req.body,9999999999);
  const prod =  await products.findById(req.body.id)
  console.log(prod,8888);
  prod.variants = req.body.variants
  prod.attributes = req.body.attributes
  console.log(prod,9998);
      products.updateOne({_id:req.body.id},prod
        )
        .then((docs) => {
          console.log(docs,5555);
          res.json(prod);
        })
        .catch((err) => console.log(err,99999999999));
});
productsModule.put("/update-many-status" , auth , (req , res) => {
  products.updateMany({"_id": req.body.items},{"productStatus.visibility": req.body.status}).then((prdcs) => {
    res.json({success: true , data: req.body})
  }).catch(err => console.log(err))
})
productsModule.put("/delete-many-status" , auth , (req , res) => {
  products.deleteMany({"_id": req.body.items}).then((prdcs) => {
    res.json({success: true , data: req.body})
  }).catch(err => console.log(err))
})

module.exports = productsModule;
