const jwt = require("jsonwebtoken");
const rejectError = require("../../mainUtils/rejectError");

const auth = async (req,res,next) => {
    if(!req.headers?.authorization) return rejectError(req , res , null , "Authorization not valid....", 400)
    try {
        let user = await jwt.verify(req.headers?.authorization, process.env.JWT_SECRET)
        req.userId = user._id;
        next()
    } catch (error) {
        return rejectError(req , res , error , "Authorization not valid...", 400)
    }
  }
module.exports =  auth