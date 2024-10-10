const User = require("../../models/UserSchema");
const bcrypt = require("bcrypt");
const rejectError = require("../../mainUtils/rejectError")
const jwt = require("jsonwebtoken")
const { schemaValidationRegister, generateToken, sendConfirmationEmail, verifyToken, forgotPasswordEmail } = require("../utils/accountUtils");
const { removeFile } = require("../utils/mediaUtils");
const Joi = require("joi");

let accountControllers = {}

accountControllers.account_post_register = async (req, res) => {
    let activationCode = await generateToken(req.body.email);
    try {
      let user = await User.findOne({ storeName: req.checkStore})
      user && rejectError(req, res, null, "This store name is already exists.");
    }
    catch (err) {
      return rejectError(req, res, err)
    }
    User.findOne({ email: req.body.email })
      .then(async (user) => {
        // await User.deleteOne({email : req.body.email , isActive: false})
        if (!user) {
          bcrypt
            .hash(req.body.password, +process.env.PASSWORD_KEY)
            .then((hashPass) => {
              new User({
                ...req.body,
                password: hashPass,
                storeName: req.checkStore,
                activationCode,
              })
                .save()
                .then(async (docs) => {
                  try {
                    await sendConfirmationEmail(req.body.email, activationCode);
                    return res.status(200).json({message: "Please check your email for confirmation", data:{email: req.body.email}});
                    } catch (err) {
                    return rejectError(req, res, err, "Oops!, Please try again.", 500)
                  }
                })
                .catch((err) => rejectError(req, res, err));
            })
            .catch((err) => rejectError(req, res, err));
        }else if (user && !user.isActive) {
          bcrypt
          .hash(req.body.password, +process.env.PASSWORD_KEY)
          .then((hashPass) => {
            user.userName = req.body.userName
            user.email = req.body.email
            user.password = hashPass
            user.activationCode = activationCode
            user
              .save()
              .then(async (docs) => {
                try {
                  await sendConfirmationEmail(req.body.email, activationCode);
                  return res.status(200).json({message: "Please check your email for confirmation", data:{email: req.body.email}});
                  } catch (err) {
                  return rejectError(req, res, err, "Oops!, Please try again.", 500)
                }
              })
              .catch((err) => rejectError(req, res, err));
          })
          .catch((err) => rejectError(req, res, err));
        }else{
          return rejectError(req, res, null, "This email is already used.", 409)
        }
      })
      .catch((err) => rejectError(req, res, err));
}
accountControllers.account_post_activationCode = async (req, res) => {
    let tokenResult = await verifyToken(req.params.activationCode)
    User.findOne({activationCode : req.params.activationCode, isActive: false}).then((user) => {
      if(user && tokenResult?.email === user.email) {
          user.isActive = true
          user.activationCode = null
          user.save().then((docs) => {
              return res.status(200).json({message: "Account has been confirmed successfully.", email: user.email});
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This confirmation code is invalid")
      }
  }).catch(err => rejectError(req , res , err))
}
accountControllers.account_post_resendEmail = async (req, res) => {
    let activationCode = await generateToken(req.body.email)
    User.findOne({email : req.body.email, isActive: false}).then((user) => {
      if(user){
          user.activationCode = activationCode
          user.save().then(async (docs) => {
            try {
              await sendConfirmationEmail(req.body.email, activationCode);
              return res.status(200).json({message: "Please check your email."});
            } catch (err) {
              return rejectError(req , res , err , "Oops!, Please try again.", 500)
            }
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This email is not exist")
      }
  }).catch(err => rejectError(req , res , err))
}
accountControllers.account_post_login = (req , res) => {
    User.findOne({email : req.body.email , isActive: true}).then((user) => {
        if(user){
            bcrypt.compare(req.body.password , user.password ).then(async (pass) =>{
                if(pass){
                    const token = await jwt.sign(
                        {_id: user._id},
                        process.env.JWT_SECRET,
                        {expiresIn:"1d"}
                    );
                    res.cookie("_auth", token, {
                      maxAge: 24 * 60 * 60 * 1000,
                      withCredentials: true,
                      httpOnly: false,
                    })
                    
                    const {_id, email, userName, avatar,phone, storeName} = user
                    return res.status(200).json({user: {_id, email, userName, avatar,phone, storeName}, token})
                }else{
                    return rejectError(req , res , null , "Email or password is invalid", 401)
                }
            }).catch(err => rejectError(req , res , err, "Email or password is invalid", 401))
        }else{
            return rejectError(req , res , null , "Email or password is invalid", 401)
        }
    }).catch(err => rejectError(req , res , err))
    
}
accountControllers.account_post_forgotPassword = async (req, res) => {
    let forgotPasswordCode = await generateToken(req.body.email)
    User.findOne({email : req.body.email, isActive: true}).then((user) => {
      if(user){
          user.forgotPasswordCode = forgotPasswordCode
          user.save().then(async () => {
            try {
              await forgotPasswordEmail(req.body.email, forgotPasswordCode)
              return res.status(200).json({message: "Please check your email."})
            } catch (err) {
              return rejectError(req, res, err, "Oops!, Please try again.", 500)
            }
          }).catch(err => rejectError(req, res, err))
      }else{
          return rejectError(req , res , null , "This email is not exist.")
      }
  }).catch(err => rejectError(req, res, err))
}
accountControllers.account_post_forgotPasswordCode = async (req, res) => { 
    let tokenResult = await verifyToken(req.params.forgotPasswordCode)
    User.findOne({forgotPasswordCode : req.params.forgotPasswordCode}).then((user) => {
      if(user && tokenResult?.email === user.email){
          bcrypt.hash(req.body.password , +process.env.PASSWORD_KEY).then((hashPass) => {
              User.updateOne({forgotPasswordCode : req.params.forgotPasswordCode},{
                  password: hashPass,
                  forgotPasswordCode: null
              }).then(async (docs) => {
                  return res.status(200).json({message: "Your password has been changed."});
              }).catch(err => rejectError(req, res, err))
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This link is not available!")
      }
  }).catch(err => rejectError(req, res, err))
}
accountControllers.account_get_addAuthToState = async (req , res) => {
  const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
  User.findById(_id,{userName: true, email: true, storeName: true, avatar: true, phone: true}).then((user) => {
      if(user){
          return res.status(200).json({user , token: req.cookies?._auth})
      }else{
          rejectError(req , res , null , "PLease Login In Your Account")
      }
  }).catch(err => rejectError(req , res ,err))
}

accountControllers.account_put_updateProfile = async (req , res) => {
      if(req.body.userName || req.body.userName === ""){
          try {
              await Joi.object({
                  userName: Joi.string().min(3).max(20).required(),
                  oldAvatar: Joi.any()
                }).validateAsync(req.body);
          } catch (err) {
            return rejectError(req, res, err)
          }
      }
      if(req.body.email){
          try {
              await Joi.object({
                  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required(),
                  oldAvatar: Joi.any()
                }).validateAsync(req.body);
          } catch (err) {
            return rejectError(req, res, err)
          }
      }
          User.updateOne({_id: req.userId}, {...req.body, avatar: req.body?.emptyAvatar ? "" : req.file?.filename}).then(docs => {
      if (req.body?.oldAvatar) {
          // SERVER_DOMAIN/media/
          let fileName = req.body?.oldAvatar.split(`${req.headers.host}/media/`,2)[1]
          if(fileName) removeFile(fileName)
      }
      if(!docs.acknowledged && !req.file?.filename && !req.body.emptyAvatar){
          return rejectError(req , res , null , "PLease Change Informations")
      }
      res.json({message: "The profile has been updated", data: {...req.body , emptyAvatar: req.body?.emptyAvatar  , avatar: req.body?.emptyAvatar ? undefined : req.file?.filename}})
  }).catch(err => console.log(err))
}
accountControllers.account_patch_changePassword = (req, res) => {
  let { current_password, password } = req.body
  User.findById(req.userId).select(["password"]).then(user => {
    bcrypt.compare(current_password , user.password ).then((pass) =>{
      if(pass){
        bcrypt.hash(password, +process.env.PASSWORD_KEY).then((hashPass) => {
            user.password = hashPass
            user.save()
            .then(() => {
              return res.status(200).json({message: "Your password has been changed"})
            }).catch((err) => rejectError(req, res, err));
        }).catch((err) => rejectError(req, res, err));
      }else{
        return rejectError(req , res , null , "Your current password is incorrect", 401)
      }
  }).catch(err => rejectError(req, res, err))
  }).catch(err => rejectError(req, res, err))
}

module.exports = accountControllers