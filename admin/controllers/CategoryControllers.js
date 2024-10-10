const Category = require("../../models/CategorySchema")
const { removeFile } = require("../utils/mediaUtils")
const paginationHandler = require("../utils/paginationUtils")
const rejectError = require("../../mainUtils/rejectError")
const { slugify } = require("../utils/slugifyUtils")

let categoryControllers = {}

categoryControllers.category_get_categories = (req, res) => {
    let {page, step, search, publish, from, to} = req.query
    
    let filters = {userOwner: req.userId}
    if(search) filters.name = {"$regex" : new RegExp(`.*${search}.*`, 'i')}
    if(publish) filters.publish = publish
    if(from || req.query.to) {
        filters.createdAt = {}
        if(from) filters.createdAt["$gte"] = new Date(from).getTime()
        if(to) filters.createdAt["$lte"] = new Date(to).setHours(23, 59, 59, 999)
    }
    Category.find(filters).then(data => {
        res.status(200).json({...paginationHandler(data, {page, step}), query: req.query});
    }).catch(err => rejectError(req, res, err, null, 400))
}
categoryControllers.category_get_categoriesForProduct = (req, res) => {
    Category.find().then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err, null, 400))
}
categoryControllers.category_post_newCategory = (req, res) => {
    new Category({...req.body, userOwner: req.userId, image: req.file?.filename, slug: req.slugify}).save().then(() => {
            res.status(200).json({message: "Category has been created successfully."});
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_post_checkSlug = (req, res) => {
    Category.findOne({userOwner: req.userId, slug: req.slugify}).then(isExist => {
        if(isExist) {
            if(isExist._id.toString() === req.body?.id) return res.status(200).json({message: `This is current slug. "${req.slugify}"`, checked: true, current: true})
            res.status(200).json({message: `Slug already exists. "${req.slugify}"`, checked: false})
        } else {
            res.status(200).json({message: `Slug is available. "${req.slugify}"`, checked: true})
        }
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_post_editCategory = (req, res) => {
    let updates = {...req.body}
    if(req.file?.filename) {
        updates.image = req.file?.filename
    } else {
        if(req.body.imageForDelete) updates.image = null
    }
    if(req.slugify) updates.slug = req.slugify
    Category.updateOne({userOwner: req.userId, _id: req.params.id}, updates)
    .then(async () => {
        if(req.body.imageForDelete) await removeFile(req.body.imageForDelete)
        res.status(200).json({message: "The Category has been updated."})
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_get_category = (req, res) => {
    Category.findOne({userOwner: req.userId, _id: req.params.id}).then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_delete_manyCategories = async (req, res) => {
    let categories = await Category.find({userOwner: req.userId, _id: req.body.itemsSelected})
    Category.deleteMany({userOwner: req.userId, _id: req.body.itemsSelected}).then(async (docs) => {
        await removeFile(categories.map(c => c?.image))
        res.status(200).json({message: `${docs.deletedCount} attributes has been deleted.`})
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_update_manyCategoriesVisibility = (req, res) => {
    Category.updateMany({userOwner: req.userId, _id: req.body.itemsSelected}, {publish: req.body.publish}).then((docs) => {
                res.status(200).json({message: `${req.body.itemsSelected.length} categories has been changed to ${req.body.publish ? "publish" : "not publish"}.`})
    }).catch(err => rejectError(req, res, err))
}
categoryControllers.category_delete_category = (req, res) => {
    Category.findByIdAndDelete({userOwner: req.userId, _id: req.params.id}).then(category => {
            if(category.image) removeFile(category.image);
            res.status(200).json({message: "The category has been deleted."});
    }).catch(err => rejectError(req, res, err))
}
// categoryControllers.category_patch_category = (req, res) => {
//     Category.updateOne({userOwner: req.userId, _id: req.params.id}, req.body).then(() => {
//         res.status(200).json({message: "The category has been updated."})
//     }).catch(err => rejectError(req, res, err))
// }
categoryControllers.category_patch_visibility = (req, res) => {
    Category.updateOne({userOwner: req.userId, _id: req.params.id}, {publish: !req.body.publish}).then(() => {
        res.status(200).json({message: "The visibility has been updated."})
    }).catch(err => rejectError(req, res, err))
}
module.exports = categoryControllers