const rejectError = require("./rejectError")
const jwt = require("jsonwebtoken")

const auth = async (req,res,next) => {
    console.log(req.headers?.authorization , 999);
    if(!req.headers?.authorization) return rejectError(req , res , null , "Authorization not valid....")
    try {
        let user = await jwt.verify(req.headers?.authorization, process.env.JWT_SECRET)
        req.userId = user._id;

    } catch (error) {
        return rejectError(req , res , error , "Authorization not valid...")
    }
    next()

  }
module.exports =  auth