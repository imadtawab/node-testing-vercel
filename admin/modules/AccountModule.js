// express
const express = require("express");
const { account_post_register, account_post_activationCode, account_post_resendEmail, account_post_login, account_post_forgotPassword, account_post_forgotPasswordCode, account_get_addAuthToState, account_put_updateProfile, account_patch_changePassword } = require("../controllers/AccountControllers");
const { validationPassword, schemaValidationRegister, checkAuthorization } = require("../utils/accountUtils");
const rejectError = require("../../mainUtils/rejectError");
const jwt = require("jsonwebtoken");
const User = require("../../models/UserSchema");
const { checkStore } = require("../utils/slugifyUtils");
const { storage } = require("../utils/mediaUtils");
const auth = require("../utils/auth");
const accountModule = express.Router();

// "/admin/account"

accountModule.post("/register",checkStore, schemaValidationRegister, account_post_register);
accountModule.post("/register/confirm-email/:activationCode", account_post_activationCode)
accountModule.post("/register/resend-email", account_post_resendEmail)

accountModule.post("/login" , account_post_login)
accountModule.post("/login/forgot-password", account_post_forgotPassword)
accountModule.post("/login/forgot-password/:forgotPasswordCode", validationPassword, account_post_forgotPasswordCode)
accountModule.get("/auth/addAuthToState",checkAuthorization, account_get_addAuthToState)

accountModule.post("/settings/update-profile", auth, storage.single("avatar"), account_put_updateProfile)
accountModule.put("/settings/change-password", auth, validationPassword, account_patch_changePassword)

module.exports = accountModule;
