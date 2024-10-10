// Handle rejecting errors
const rejectError = (req , res , error , message , status) => {
    console.error(`******************************************\n      Start error in : ${req.originalUrl}\n******************************************\n${error ? error : message}\n******************************************\n      End error in : ${req.originalUrl}\n******************************************`)
    return res.status(status || 400).json({message: message ? message : error})
}
module.exports = rejectError