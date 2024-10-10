const rejectError = require("../../mainUtils/rejectError");
const Joi = require("joi");

let attributeUtils = {}

attributeUtils.validateAttributeSchema = (req, res, next) => {
  Joi.object({
      unique_name: Joi.string().max(20).required(),
      public_name: Joi.string().max(20).required(),
      type: Joi.string().required(),
      publish: Joi.boolean().required(),
      values: Joi.array().min(1).items(Joi.object({
        name: Joi.string().required(),
        color: req.body.type === "colorSpans" ? Joi.string().pattern(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")).required() : null
    })).required(),
    }).validateAsync(req.body).then(() => next()).catch(err => rejectError(req, res, err.details[0].message))
};
attributeUtils.validateEditAttributeSchema = (req, res, next) => {
  Joi.object({
      unique_name: Joi.string().max(20),
      public_name: Joi.string().max(20),
      typeForJoi: Joi.any(),
      valuesCreated: Joi.array(),
      valuesEdited: Joi.array(),
      valuesDeleted: Joi.array(),
      publish: Joi.boolean(),
      values: Joi.array().items(Joi.object({
        _id: Joi.any(),
        name: Joi.string().required(),
        color: req.body.typeForJoi === "colorSpans" ? Joi.string().pattern(new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")).required() : null
    })),
    }).validateAsync(req.body).then(() => next()).catch(err => rejectError(req, res, err.details[0].message))
};
module.exports = attributeUtils