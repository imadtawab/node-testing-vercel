const rejectError = require("../../mainUtils/rejectError")

let slugifyUtils = {}

slugifyUtils.slugify = (req, res, next) => {
    let regExp = new RegExp(/^[a-zA-Z0-9 \-]*$/)

    if(req.body.slug === "") return res.status(200).json({message: 'Slug is required.', checked: false})
    
    if(!regExp.test(req.body.slug)) return res.status(200).json({message: 'Slug matches not contain special characters.', checked: false})

    req.slugify =  req.body.slug ? req.body.slug.toLowerCase().split(/\s+|\W+|_/).filter(l => l.trim() !== "").join("-") : null
    next()
  }

slugifyUtils.checkStore = (req, res, next) => {
  let regExp = new RegExp(/^[a-zA-Z0-9]*$/)

  if(!regExp.test(req.body.storeName)) return rejectError(req, res, null, 'StoreName matches not contain special characters.')

  req.checkStore =  req.body.storeName ? req.body.storeName.toLowerCase() : null
  next()
}

module.exports = slugifyUtils