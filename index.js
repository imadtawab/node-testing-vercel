/**************************** */
/*******   Settings  ******** */
/**************************** */
// express
const express = require("express")
const app = express()

// dot env
require('dotenv').config();

// cors
const cors = require('cors')
app.use(cors({
    origin: [process.env.CLIENT_DOMAINE],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))


// express session
const session = require('express-session');
// Add express-session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));

// passport
const passport = require('passport')
// const LocalStrategy = require('passport-local').Strategy
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// passport.use(new LocalStrategy((email , password , done) => {
//     console.log(email , password , "**************");
//     users.findOne({email : email , isActive: true}).then((user) => {
//     if(user){
//         bcrypt.compare(password , user.password ).then(async (pass) =>{
//             if(pass){
//                 // const token = await jwt.sign(
//                 //     {_id: user._id},
//                 //     process.env.JWT_SECRET,
//                 //     {expiresIn:"1d"}
//                 // );
//                 // res.cookie("token", token)
//                 // return res.json({success: true , user, token})
//                 return done(null, user);
//             }else{
//                 rejectError(req , res , null , "Email or password is invalid")
//                 return done(null, false, { message: "Email or password is invalid" });
//                 // return res.json({success: false , error: "Email or password is invalid"})
//             }
//         })
//     }else{
//         rejectError(req , res , null , "Email or password is invalid")
//         return done(null , false, {message: "Email or password is invalid"})
//     //    return res.json({success: false , error: "Email or password is invalid"})
//     }
// }).catch(err => rejectError(res , res , err))
// }))
// // cookiesParser
const cookieParser = require("cookie-parser")
app.use(cookieParser());



// json
// app.use(express.urlencoded()); // support encoded bodies
app.use(express.json());

// static folder
const path = require("path")
app.use(express.static(path.join(__dirname,"public")))


// Connect to mongodb
const mongoose=require('mongoose');
mongoose.connect(process.env.DB).then(() => {
    console.log("DATABASE connected ...");
    // listen 
    app.listen(process.env.PORT,() => console.log("Server Started : http://localhost:"+process.env.PORT))
}).catch((err)=> console.log(err))


/**************************** */
/*******   ADMIN     ******** */
/**************************** */
// Routers
const adminRouter = require("./routers/admin/AdminRouter")
app.use("/admin" ,adminRouter)

const clientRouter = require("./routers/client/ClientRouter");
const products = require("./models/admin/product_schema");
const users = require("./models/admin/user_schema");
const orders = require("./models/admin/order_schema");
const categories = require("./models/admin/category_schema");
const attributes = require("./models/admin/attribute_schema");
app.use("/client" ,clientRouter)

app.get("/media/:img" , (req , res) => {
    res.sendFile(path.join(__dirname,"public/uploads",req.params.img))
})
// 404 
app.all("*", (req,res)=>{
    return res.status(404).json({
        message: "Page Not Found!"
    })
});


