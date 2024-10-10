const { removeFile } = require("./mediaUtils");
const rejectError = require("../../mainUtils/rejectError");
const Joi = require("joi");

let categoryUtils = {}

categoryUtils.validateCategorySchema = (req, res, next) => {
  Joi.object({
      name: Joi.string().min(3).max(20).required(),
      slug: Joi.string().required(),
      publish: Joi.boolean().required(),
      description: Joi.string().min(0),
      image: Joi.any(),
    }).validateAsync(req.body).then(() => next()).catch(err => {
      if(req.file?.filename) removeFile(req.file.filename)
      rejectError(req, res, err.details[0].message)
    })
};
categoryUtils.validateEditCategorySchema = (req, res, next) => {
  Joi.object({
      name: Joi.string().min(3).max(20),
      slug: Joi.string(),
      publish: Joi.boolean(),
      description: Joi.string().min(0),
      image: Joi.any(),
      imageForDelete: Joi.string(),
    }).validateAsync(req.body).then(() => next()).catch(err => {
      if(req.file?.filename) removeFile(req.file.filename)
      rejectError(req, res, err.details[0].message)
    })
};
module.exports = categoryUtils