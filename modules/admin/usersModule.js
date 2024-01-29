// express
const express = require("express");
const usersModule = express.Router();
const users = require("../../models/admin/user_schema")
const bcrypt = require("bcrypt")
// multer
const multer = require("multer");
// JWT
const jwt = require("jsonwebtoken")
// fs
const fs  = require("fs")
// joi
const Joi = require("joi")

// nodemailer
const nodemailer = require("nodemailer");
const rejectError = require("../../utils/rejectError");


const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "testrimad@gmail.com",
        pass: "uthjvmlvdrxuiwgj",
    },
});



// "/admin/account"
usersModule.get("/all" , (req , res) => {
    // users.deleteOne({email: "testrimad@gmail.com"}).then(a => res.json(a))
    users.find().then(a => res.json(a))


})
usersModule.get("/auth/addAuthToState",async (req , res) => {
    try {
        await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    } catch (error) {
        // console.log(error , "error authentication 1 ....");
        return rejectError(req , res , error , "Authorization is not valid")
        // return res.json({success: false , error: "Authorization is not valid"})
    }
    const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    console.log(_id , "success authentication 1 ....");
    users.findById(_id,{password: false}).then((user) => {
        if(user){
            return res.json({success: true , user , token: req.cookies?._auth})
        }else{
            rejectError(req , res , null , "PLease Login In Your Account")
            // return res.json({success: false , error: "PLease Login In Your Account"})
        }
        console.log(docs);
    }).catch(err => console.log(err))
})
let schemaValidationRegister = Joi.object({
    userName: Joi.string().min(3).max(20).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required(),
    password: Joi.string().min(8).max(30).pattern(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,30}$/).required().messages({
        "string.pattern.base": "Password Fails To Match letters (uppercase, lowercase), numbers, and underscores",
    }),
    confirmPassword: Joi.ref('password'),
    //   .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@#$%^&*()_+\-=\[\]{};:'",.<>\/?]+$/) // letters, numbers, and dashes
  })
  let sendConfirmationEmail = (email, activationCode) => {
    transport.sendMail({
        from: "testrimad@gmail.com",
        to: email,
        subject: "Confirm your acount",
        html: ` <div>
                    <h1>Email for Confirmation</h1>
                    <h2>Hy dear,</h2>
                    <p>For active your acount , Please click in the link</p>
                    <a href="${process.env.CLIENT_DOMAINE}/admin/account/confirm_email/${activationCode}"> Click here !</a>
                </div>`
        }).then((docs) => {
            console.log(docs)
            console.log(`${process.env.CLIENT_DOMAINE}/admin/account/confirm_email/${activationCode}`,"email sended ...");
            return docs

        }).catch(err => {
            console.log(err,"not send")
            return err
        })
}
usersModule.post("/register" , async (req , res) => {
    // Form Validations
    try {
        await schemaValidationRegister.validateAsync(req.body);
    }
    catch (err) {
        res.json({success:false, error: err.details[0].message})
        return
     }
     await users.deleteOne({email : req.body.email , isActive: false})
     // Create activationCode Token
    //  let characters = "0123456789abcdefghijklmnopqrstuvwxyzyxwvutsrqponABCDEFGHIJKLMNOPQRSTUVWXYZYXWVUTSRQPON"
    //  let activationCode = ""
    //  for (let i = 0; i < 50; i++) {
    //      activationCode += characters[Math.floor(Math.random() * characters.length)]        
    //  }
     
     const generateToken = (email) => {
        const secretKey = process.env.JWT_SECRET;
        const expiresIn = '60min'; // Set the expiration time (e.g., 1 hour)
      
        const token = jwt.sign({ email }, secretKey, { expiresIn });
        return token;
      };
      let activationCode = await generateToken(req.body.email)
    users.findOne({email : req.body.email}).then((user) => {
        console.log("activationCode : ",activationCode);
        if(!user){
            bcrypt.hash(req.body.password , +process.env.PASSWORD_KEY).then((hashPass) => {
                                new users({
                                        ...req.body,
                                        password: hashPass,
                                        activationCode,
                                    }).save().then(async (docs) => {
                                        await sendConfirmationEmail(req.body.email,activationCode)
                                        return res.json({success: true , data: docs})
                                    }).catch(err => console.log(err))
            }).catch(err => rejectError(req , res , err))
        }else{
            return rejectError(req , res , null , "This email is already used")
        //    return res.json({success: false , error: "This email is already used"})
        }
    }).catch(err => console.log(err))
    
})
usersModule.post("/register/confirm_email/:activationCode" , async (req, res) => {
    console.log(req.params.activationCode)
    const verifyToken = (token) => {
        const secretKey = process.env.JWT_SECRET;
      
        try {
          const decoded = jwt.verify(token, secretKey);
          return decoded;
        } catch (err) {
          console.error('Token verification failed:', err.message);
          return null;
        }
      };
      let tokenResult = await verifyToken(req.params.activationCode)
      console.log("varifer : " ,tokenResult);
    users.findOne({activationCode : req.params.activationCode, isActive: false}).then((user) => {
        if(user && tokenResult?.email === user.email) {
            user.isActive = true
            user.activationCode = null
            user.save().then(async (docs) => {
                return res.json({success: true , data: docs})
            }).catch(err => console.log(err))
        }else{
            return rejectError(req , res , null , "This confirmation code is invalid")
        //    return res.json({success: false , error: "This confirmation code is invalid"})
        }
    }).catch(err => console.log(err))
})
usersModule.post("/register/resend-email" , async (req, res) => {
    console.log(req.body.email)
     // Create activationCode Token
    //  let characters = "0123456789abcdefghijklmnopqrstuvwxyzyxwvutsrqponABCDEFGHIJKLMNOPQRSTUVWXYZYXWVUTSRQPON"
    //  let activationCode = ""
    //  for (let i = 0; i < 50; i++) {
    //      activationCode += characters[Math.floor(Math.random() * characters.length)]        
    //  }
    const generateToken = (email) => {
        const secretKey = process.env.JWT_SECRET;
        const expiresIn = '60min'; // Set the expiration time (e.g., 1 hour)
      
        const token = jwt.sign({ email }, secretKey, { expiresIn });
        return token;
      };
      let activationCode = await generateToken(req.body.email)

    users.findOne({email : req.body.email}).then((user) => {
        if(user){
            user.activationCode = activationCode
            user.save().then(async (docs) => {
                transport.sendMail({
                    from: "testrimad@gmail.com",
                    to: req.body.email,
                    subject: "Confirm your acount",
                    html: ` <div>
                                <h1>Email for Confirmation</h1>
                                <h2>Hy dear,</h2>
                                <p>For active your acount , Please click in the link</p>
                                <a href="${process.env.CLIENT_DOMAINE}/admin/account/confirm_email/${activationCode}"> Click here !</a>
                            </div>`
                    }).then((docs) => {
                        return res.json({success: true , data: docs}) 
            
                    }).catch(err => {
                        return rejectError(req , res , err , "Email not sended!")
                        // return res.json({success: false , error: "Email not sended!"}) 
                    })
            }).catch(err => console.log(err))
        }else{
            return rejectError(req , res , null , "This email is not exist")
        //    return res.json({success: false , error: "This email is not exist"})
        }
    }).catch(err => console.log(err))
})


usersModule.post("/login" , (req , res) => {
    console.log(req.body);
    users.findOne({email : req.body.email , isActive: true}).then((user) => {
        if(user){
            bcrypt.compare(req.body.password , user.password ).then(async (pass) =>{
                if(pass){
                    const token = await jwt.sign(
                        {_id: user._id},
                        process.env.JWT_SECRET,
                        {expiresIn:"1d"}
                    );
                    res.cookie("token", token)
                    return res.json({success: true , user, token})
                }else{
                    return rejectError(req , res , null , "Email or password is invalid")
                    // return res.json({success: false , error: "Email or password is invalid"})
                }
            })
        }else{
            return rejectError(req , res , null , "Email or password is invalid")
        //    return res.json({success: false , error: "Email or password is invalid"})
        }
    }).catch(err => console.log(err))
    
})
usersModule.post("/login/forgot-password" , async (req, res) => {
    console.log(req.body.email)
     // Create activationCode Token
    //  let characters = "0123456789abcdefghijklmnopqrstuvwxyzyxwvutsrqponABCDEFGHIJKLMNOPQRSTUVWXYZYXWVUTSRQPON"
    //  let forgotPasswordCode = ""
    //  for (let i = 0; i < 50; i++) {
    //     forgotPasswordCode += characters[Math.floor(Math.random() * characters.length)]        
    //  }
    const generateToken = (email) => {
        const secretKey = process.env.JWT_SECRET + "passsword";
        const expiresIn = '60min'; // Set the expiration time (e.g., 1 hour)
      
        const token = jwt.sign({ email }, secretKey, { expiresIn });
        return token;
      };
      let forgotPasswordCode = await generateToken(req.body.email)
      console.log("forgotPasswordCode : ", forgotPasswordCode);

    users.findOne({email : req.body.email}).then((user) => {
        if(user){
            user.forgotPasswordCode = forgotPasswordCode
            user.save().then(async (docs) => {
                // transport.sendMail({
                //     from: "testrimad@gmail.com",
                //     to: req.body.email,
                //     subject: "Forgot your password",
                //     html: ` <div>
                //                 <h1>Email for forgot your password</h1>
                //                 <h2>Hy dear,</h2>
                //                 <p>For forgot your password , Please click in the link</p>
                //                 <a href="${process.env.CLIENT_DOMAINE}/admin/account/forgot-password/${forgotPasswordCode}"> Click here !</a>
                //             </div>`
                //     }).then((docs) => {
                //         return res.json({success: true , data: docs}) 
            
                //     }).catch(err => {
                //         return res.json({success: false , error: "Email not sended!"}) 
                //     })
                transport.sendMail({
                    from: "testrimad@gmail.com",
                    to: req.body.email,
                    subject: "Forgot your password",
                    html: `   <html>
                    <head>
                      <style>
                        body {
                          font-family: 'Arial', sans-serif;
                          background-color: #f0f0f0;
                        }
                        h1 {
                          color: #333333;
                        }
                        p {
                          color: #555555;
                        }
                        a {
                            display: block;
                            padding: 10px 20px;
                            // color:#fff;
                            // background-color: #007bff;
                        }
                      </style>
                    </head>
                    <body>
                        <h1>Hello!</h1>
                        <h2>EverShop , Forgot your password?</h2>
                        <p>For forgot your password , Please click in the link</p>
                        <a href="${process.env.CLIENT_DOMAINE}/admin/account/forgot-password/${forgotPasswordCode}"> Click here !</a>
                    </body>
                  </html>`
                    }).then((docs) => {
                        return res.json({success: true , data: docs}) 
            
                    }).catch(err => {
                        return rejectError(req , res , err , "Email not sended!")
                        // return res.json({success: false , error: "Email not sended!"}) 
                    })
            }).catch(err => console.log(err))
        }else{
            return rejectError(req , res , null , "This email is not exist")
        //    return res.json({success: false , error: "This email is not exist"})
        }
    }).catch(err => console.log(err))
})
usersModule.post("/login/forgot-password/:forgotPasswordCode" , async (req, res) => { 
    console.log(req.body , req.params);
    try {
        await Joi.object({
            password: Joi.string().min(8).max(30).pattern(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,30}$/).required().messages({
                "string.pattern.base": "Password Fails To Match letters (uppercase, lowercase), numbers, and underscores",
            }),
            confirmPassword: Joi.ref('password'),
          }).validateAsync(req.body);
    }
    catch (err) {
        res.json({success:false, error: err.details[0].message})
        return
     }

     const verifyToken = (token) => {
        const secretKey = process.env.JWT_SECRET + "passsword";
      
        try {
          const decoded = jwt.verify(token, secretKey);
          return decoded;
        } catch (err) {
          console.error('Token verification failed:', err.message);
          return null;
        }
      };
      let tokenResult = await verifyToken(req.params.forgotPasswordCode)
      console.log("tokenResultpasswrd" , tokenResult)
    users.findOne({forgotPasswordCode : req.params.forgotPasswordCode}).then((user) => {
        console.log("aaaaaaa",tokenResult , user.email , user && tokenResult?.email === user.email);
        if(user && tokenResult?.email === user.email){
            bcrypt.hash(req.body.password , +process.env.PASSWORD_KEY).then((hashPass) => {
                users.updateOne({forgotPasswordCode : req.params.forgotPasswordCode},{
                    password: hashPass,
                    forgotPasswordCode: null
                }).then(async (docs) => {
                    return res.json({success: true , data: docs})
                }).catch(err => console.log(err))
            }).catch(err => rejectError(req , res , err))
        }else{
            return rejectError(req , res , null , "This link is not available!")
        //    return res.json({success: false , error: "This link is not available!"})
        }
    }).catch(err => console.log(err))
})
// #####################
const storage = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/uploads");
      },
      filename: function (req, file, cb) {
        console.log(file,5);
        cb(null, `${Date.now()}_${file.originalname.replace("+","")}`);
      },
    }),
  });

usersModule.put("/settings/profile/update" , storage.single("avatar"), async (req , res) => {
    console.log(req.body);


        if(req.body.userName || req.body.userName === ""){
            try {
                await Joi.object({
                    userName: Joi.string().min(3).max(20).required()
                  }).validateAsync(req.body);
            } catch (err) {
                res.json({success:false, error: err.details[0].message})
                return
            }
        }
        if(req.body.email){
            try {
                await Joi.object({
                    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required()
                  }).validateAsync(req.body);
            } catch (err) {
                res.json({success:false, error: err.details[0].message})
                return
            }

        }
            try {
                await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
            } catch (error) {
                // console.log(error , "error authentication 2 ....");
                return rejectError(req , res , error , "Authorization is not valid")
                // return res.json({success: false , error: "Authorization is not valid"})
            }
            const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
            console.log(_id , "success authentication 2 ....");

    users.updateOne({_id}, {...req.body, avatar: req.body?.emptyAvatar ? "" : req.file?.filename}).then(docs => {
        console.log(docs);
        // req.file?.filename && 
        if (req.body?.oldAvatar) {
            // http://localhost:3500/media/
            let path = `./public/uploads/${req.body?.oldAvatar.split("http://localhost:3500/media/",2)[1]}`
            fs.unlink(path,(err) => {
                if (err) {
                    console.log(err,"not deleted ???")
                } else {
                  console.log("deleted....");
    
                }
            })
        }
        if(!docs.acknowledged && !req.file?.filename && !req.body.emptyAvatar){
            return rejectError(req , res , null , "PLease Change Informations")
            // res.json({success: false , error: "PLease Change Informations"})
            // return
        }
        res.json({success: true , data: {...req.body , emptyAvatar: req.body?.emptyAvatar  , avatar: req.body?.emptyAvatar ? undefined : req.file?.filename}})
    }).catch(err => console.log(err))
})
let schemaValidationUpdatePassword = Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(30).pattern(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,30}$/).required().messages({
        "string.pattern.base": "Password Fails To Match letters (uppercase, lowercase), numbers, and underscores",
    }),
    confirm_password: Joi.ref('new_password'),
  })
usersModule.put("/settings/password/update" , async (req , res) => {
    try {
        await schemaValidationUpdatePassword.validateAsync(req.body);
    }
    catch (err) {
        res.json({success:false, error: err.details[0].message})
        return
     }
        try {
        await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    } catch (error) {
        // console.log(error , "error authentication 3 ....");
        return rejectError(req , res , error , "Authorization is not valid")
        // return res.json({success: false , error: "Authorization is not valid"})
    }
    const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    console.log(_id , "success authentication 3 ....");
    users.findById({_id}).then(user => {
        bcrypt.compare(req.body.current_password,user.password).then((pass_checked) => {
            if (pass_checked) {
                console.log(pass_checked);
                bcrypt.hash(req.body.new_password , +process.env.PASSWORD_KEY).then(hashPass => {
                    user.password = hashPass
                    user.save().then(newUser => {
                        res.json({success: "Password changed successfully"})  
                    }).catch(err => console.log(err))
                }).catch(err => console.log(err))
                return
            }
            return rejectError(req , res , null , "Current password is incorrect !")
            // res.json({success: false, error: "Current password is incorrect !"})
        }).catch(err => console.log(err))
    })
})





// get user for testing
usersModule.get("/userrr" , storage.single("avatar"), async (req , res) => {
        try {
        await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    } catch (error) {
        // console.log(error , "error authentication 4 ....");
        return rejectError(req , res , error , "Authorization is not valid")
        // return res.json({success: false , error: "Authorization is not valid"})
    }
    const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    console.log(_id , "success authentication 4 ....");
    users.findById({_id} , {_id: true , email: true , userName: true, avatar: true , password: true}).then(user => {
        res.json(user)
    })
})

module.exports = usersModule;