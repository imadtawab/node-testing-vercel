/**************************** */
/*******   Settings  ******** */
/**************************** */
// express
const express = require("express")
const app = express()

// .env
require('dotenv').config();

// cors
const cors = require('cors')
app.use(cors({
    origin: [
        /^https:\/\/react-testing-vercel-five.vercel.app/,
        /^https:\/\/[a-z0-9]+\.react-testing-vercel-five.vercel.app/
    ],
    // origin: [process.env.CLIENT_DOMAINE],
    
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))

// cookiesParser
const cookieParser = require("cookie-parser")
app.use(cookieParser())

// json
app.use(express.urlencoded({ extended: true}))
app.use(express.json());

// static folder
const path = require("path")
app.use(express.static(path.join(__dirname,"public")))

// Use multer for multipart/form-data
// app.use(upload.none());

// Connect to mongodb
const connectToDB = require("./config/config_db")
connectToDB(() => app.listen(process.env.PORT,() => console.log("Server Started : http://localhost:"+process.env.PORT)))


const authClient = (req, res, next) => {
    User.findOne({storeName: req.headers.subdomain}).then(user => {
        if(user) {
            req.userId = user._id
            return next()
        }
        return rejectError(req, res, null, "Sorry..., The store is not available")
    }).catch(err => rejectError(req, res, err))
}
// Routers
const adminRouter = require("./routers/AdminRouter");
const clientRouter = require("./routers/ClientRouter");
const User = require("./models/UserSchema");
const rejectError = require("./mainUtils/rejectError");
app.use("/admin", adminRouter)
app.use("/client", authClient, clientRouter)

app.get("/media/:img" , (req , res) => {
    res.sendFile(path.join(__dirname,"public/uploads",req.params.img))
})

// 404 
app.all("*", (req,res)=>{
    return res.status(404).json({
        message: "Page Not Found!!"
    })
});
