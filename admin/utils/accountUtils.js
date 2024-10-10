const jwt = require("jsonwebtoken");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const rejectError = require("../../mainUtils/rejectError");

// nodemailer transport
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: "testrimad@gmail.com",
      pass: "uthjvmlvdrxuiwgj",
  },
});

let accountUtils = {}
// Regsiter Validations
accountUtils.schemaValidationRegister = (req, res, next) => {
  Joi.object({
    storeName: Joi.string().min(3).max(10).required(),
    userName: Joi.string().min(3).max(20).required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com"] } })
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,30}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password Fails To Match letters (uppercase, lowercase), numbers, and underscores",
      }),
    confirm_password: Joi.any().required().valid(Joi.ref('password')),
  }).validateAsync(req.body).then(() => next()).catch(err => rejectError(req, res, err.details[0].message))
}
accountUtils.validationPassword = (req, res, next) => {
    Joi.object({
      current_password: Joi.any(),
      password: Joi.string().min(8).max(30).pattern(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,30}$/).required().messages({
          "string.pattern.base": "Password Fails To Match letters (uppercase, lowercase), numbers, and underscores",
      }),
      confirm_password: Joi.any().required().valid(Joi.ref('password')),
    }).validateAsync(req.body).then(() => next()).catch(err => rejectError(req, res, err.details[0].message))
}
// send Email for confimation
accountUtils.sendConfirmationEmail = (email, activationCode) => {
    transport.sendMail({
        from: "testrimad@gmail.com",
        to: email,
        subject: "Confirm your acount",
        html: ` <div>
                    <h1>Email for Confirmation</h1>
                    <h2>Hy dear,</h2>
                    <p>For active your acount , Please click in the link</p>
                    <a href="${process.env.CLIENT_DOMAINE}/admin/account/register/confirm_email/${activationCode}"> Click here !</a>
                </div>`
        }).then(docs => docs).catch(err => err)
}
accountUtils.forgotPasswordEmail = (email, forgotPasswordCode) => {
  transport.sendMail({
    from: "testrimad@gmail.com",
    to: email,
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
    }).then(docs => docs).catch(err => err)
}
accountUtils.generateToken = (email) => {
    const secretKey = process.env.JWT_SECRET;
    const expiresIn = "60min"; // Set the expiration time (e.g., 1 hour)
    const token = jwt.sign({ email }, secretKey, { expiresIn });
    return token;
};
accountUtils.verifyToken = (token) => {
  const secretKey = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    return null;
  }
};
accountUtils.checkAuthorization = async (req, res, next) => {
  try {
    await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
} catch (error) {
    return rejectError(req , res , error , "Authorization is not valid")
}
next()
}

module.exports = accountUtils