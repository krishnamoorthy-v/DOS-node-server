const express = require("express")
const {signup, login, passwordResetEmail, passwordReset, sessionLogout, sessionLogin, deleteUser} = require("../controller/accountController")
const { authorize } = require("../utils/jwtHelper")

account = express.Router()

account.post("/signup", signup )
account.post("/login", login )
account.get("/login", sessionLogin)
account.delete("/logout", sessionLogout)
account.post("/password/reset", passwordResetEmail)
account.post("/password/reset/confirm/:token", passwordReset)
account.delete("/delete/user/:userid", authorize("delete"), deleteUser)

module.exports = account;