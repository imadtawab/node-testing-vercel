// Handle rejecting errors
const rejectError = (req , res , error , message) => {
    console.error(`******************************************\n      Start error in : ${req.originalUrl}\n******************************************\n${error ? error : message}\n******************************************\n      End error in : ${req.originalUrl}\n******************************************`)
    return res.json({success: false , error: message ? message : error})
}
module.exports = rejectError