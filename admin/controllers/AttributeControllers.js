const Attribute = require("../../models/AttributeSchema");
const AttributeValue = require("../../models/Attribute_valueSchema");
const paginationHandler = require("../utils/paginationUtils");
const rejectError = require("../../mainUtils/rejectError");

let attributeControllers = {}

// attributeControllers.attribute_post_value = (req, res) => {
//     new AttributeValue({...req.body, attributeOwner: req.params.attrId}).save().then(value => {
//         Attribute.updateOne({userOwner: req.userId, _id: req.params.attrId}, {$push: {valuesOwner: value._id}}).then(() => {
//             res.status(200).json({message: "The value has been created.", data: {value}});
//         }).catch(err => rejectError(req, res, err))
//     }).catch(err => rejectError(req, res, err))
// }
// attributeControllers.attribute_delete_value = (req, res) => {
//     AttributeValue.deleteOne({_id: req.params.id, attributeOwner: req.params.attrId}).then(() => {
//         Attribute.updateOne({userOwner: req.userId, _id: req.params.attrId}, {$pull: {valuesOwner: req.params.id}}).then(() => {
//             res.status(200).json({message: "The value has been deleted."});
//         }).catch(err => rejectError(req, res, err))
//     }).catch(err => rejectError(req, res, err))
// }
// attributeControllers.attribute_patch_value = (req, res) => {
//     AttributeValue.updateOne({_id: req.params.id, attributeOwner: req.params.attrId}, req.body).then(() => {
//         res.status(200).json({message: "The value has been updated."})
//     }).catch(err => rejectError(req, res, err))
// }
attributeControllers.attribute_get_attributes = (req, res) => {
    let {page, step, search, type, publish, from, to} = req.query

    let filters = {userOwner: req.userId}
    if(search) {
        filters["$or"] = [
            {public_name: {"$regex" : new RegExp(`.*${search}.*`, 'i')}},
            {unique_name: {"$regex" : new RegExp(`.*${search}.*`, 'i')}}
        ]
    }
    if(type) filters.type = type
    if(publish) filters.publish = publish
    if(from || req.query.to) {
        filters.createdAt = {}
        if(from) filters.createdAt["$gte"] = new Date(from).getTime()
        if(to) filters.createdAt["$lte"] = new Date(to).setHours(23, 59, 59, 999)
    }
    Attribute.find(filters).then(data => {
        res.status(200).json({...paginationHandler(data, {page, step}), query: req.query});
    }).catch(err => rejectError(req, res, err))
}
attributeControllers.attribute_post_newAttribute = (req, res) => {
    AttributeValue.insertMany(req.body.values).then(values => {
        let valuesOwner = values.map(v => v._id)
        new Attribute({...req.body, valuesOwner, userOwner: req.userId}).save().then((attribute) => {
            AttributeValue.updateMany({_id: valuesOwner}, {attributeOwner: attribute._id}).then(() => {
                res.status(200).json({message: "Attribute has been created successfully."});
            }).catch(err => rejectError(req, res, err))
        }).catch(err => rejectError(req, res, err))
    }).catch(err => rejectError(req, res, err))
}
attributeControllers.attribute_post_editAttribute = async (req, res) => {
        // Edit Values
        try {
            if(req.body.valuesEdited) {
                req.body.valuesEdited.forEach(async v => {
                    await AttributeValue.updateOne({_id: v._id}, v)
                })
            }
        } catch (err) {
            return rejectError(req, res, err)
        }
        // Delete Values
        try {
            await AttributeValue.deleteMany({_id: req.body.valuesDeleted})
        } catch (err) {
            return rejectError(req, res, err)
        }
        // Create Values
        try {
            let newValues = req.body.valuesCreated ? await AttributeValue.insertMany(req.body.valuesCreated) : null
        // Update Attribute
            let newValuesUpdates = {...req.body}
            if(newValues) newValuesUpdates["$push"] = { valuesOwner: { $each: newValues.map(a => a._id) } }
            Attribute.updateOne({userOwner: req.userId, _id: req.params.id}, newValuesUpdates).then(async () => {
                let deleteValuesUpdates = null
                if(req.body.valuesDeleted) {
                    deleteValuesUpdates = {"$pull": { valuesOwner: { $in: req.body.valuesDeleted } }}
                    try {
                        await Attribute.updateOne({_id: req.params.id}, deleteValuesUpdates)
                    } catch (err) {
                        rejectError(req, res, err)
                    }
                }
                res.status(200).json({message: "The attribute has been updated."})
            }).catch(err => rejectError(req, res, err))
        } catch (err) {
            return rejectError(req, res, err)
        }
}
attributeControllers.attribute_get_attribute = (req, res) => {
    Attribute.findOne({userOwner: req.userId, _id: req.params.id}).populate("valuesOwner", ["name", "color"]).then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err))
}
attributeControllers.attribute_delete_attribute = (req, res) => {
    Attribute.findByIdAndDelete({userOwner: req.userId, _id: req.params.id}).then(attribute => {
        AttributeValue.deleteMany({_id: attribute.valuesOwner}).then(() => {
            res.status(200).json({message: "The attribute has been deleted."});
        }).catch(err => rejectError(req, res, err))
    }).catch(err => rejectError(req, res, err))
}
// attributeControllers.attribute_patch_attribute = (req, res) => {
//     Attribute.updateOne({userOwner: req.userId, _id: req.params.id}, req.body).then(() => {
//         res.status(200).json({message: "The attribute has been updated."})
//     }).catch(err => rejectError(req, res, err))
// }
attributeControllers.attribute_patch_visibility = (req, res) => {
    Attribute.updateOne({userOwner: req.userId, _id: req.params.id}, {publish: !req.body.publish}).then(() => {
        res.status(200).json({message: "The visibility has been updated."})
    }).catch(err => rejectError(req, res, err))
}
attributeControllers.attribute_delete_manyAttributes = (req, res) => {
    Attribute.find({userOwner: req.userId, _id: req.body.itemsSelected}).then((docs) => {
        let allValuesId = []
        docs.forEach(i => {
            allValuesId = [...allValuesId, ...i.valuesOwner]
        })
        AttributeValue.deleteMany({_id: allValuesId}).then(() => {
            Attribute.deleteMany({_id: req.body.itemsSelected}).then((docs) => {
                res.status(200).json({message: `${docs.deletedCount} attributes has been deleted.`})
            }).catch(err => rejectError(req, res, err))
        }).catch(err => rejectError(req, res, err))
    }).catch(err => rejectError(req, res, err))
}
attributeControllers.attribute_update_manyAttributesVisibility = (req, res) => {
    Attribute.updateMany({userOwner: req.userId, _id: req.body.itemsSelected}, {publish: req.body.publish}).then((docs) => {
                res.status(200).json({message: `${req.body.itemsSelected.length} attributes has been changed to ${req.body.publish ? "publish" : "not publish"}.`})
    }).catch(err => rejectError(req, res, err))
}
module.exports = attributeControllers