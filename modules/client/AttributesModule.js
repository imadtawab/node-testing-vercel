// express
const express = require("express");
const Attributes = require("../../models/admin/attribute_schema");
const products = require("../../models/admin/product_schema");
const attributesModule = express.Router();
// rejectError
const rejectError = require("../../utils/rejectError")
// multer
const multer = require("multer");
const users = require("../../models/admin/user_schema");

// /client/categories
attributesModule.get("/" , (req, res) => {
  console.log("object");
  products.find({"productStatus.visibility": "true"} , {attributes: true , _id: false}).then(async products => {
      let findAttributes = products.map(p => p.attributes)
      let allAttributes = []
      // {id , valuesId}
      // console.log(findAttributes,'ee');
      await findAttributes.forEach(current => {
          if (current.length) {;
            current.forEach(att => {
                let exist = allAttributes.filter(a => a._id === att.attributeId)[0]
                if(exist){
                    allAttributes = allAttributes.map(a => {
                        if(a._id === att.attributeId){
                            let values = a.valuesId
                            att.attributeValuesId.forEach(item => {
                                if (values.indexOf(item) === -1) {
                                    values.push(item)
                                }
                            })
                            return {
                                _id: att.attributeId ,
                                valuesId: values ,
                                // number: a.number + 1
                            }
                        }
                        return a
                    })
                }else{
                    // number: 1
                    allAttributes.push({_id: att.attributeId , valuesId: att.attributeValuesId })
                }
            })
        }
    })
    // return res.json(allAttributes);
    let allAttributes1 = []
    Attributes.find().then((attributes) => {
        attributes.forEach((oldAtt) => {
            allAttributes.forEach(newAtt => {
                if(oldAtt._id.toString() === newAtt._id.toString()){
                    let values = []
                    oldAtt.values.forEach(v => {
                        if(newAtt.valuesId.indexOf(v.id) !== -1){
                            values.push(v)
                        }
                    })
                    allAttributes1.push({
                        _id: oldAtt._id,
                        public_name: oldAtt.public_name,
                        type: oldAtt.type,
                        values
                    })
                }
            })
        })
        res.json({success:true , data: allAttributes1});
    })
  }).catch((err) => rejectError(req , res , err , null));
});
module.exports = attributesModule;
