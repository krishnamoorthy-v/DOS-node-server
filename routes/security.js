const express = require("express")
const {authorize} = require("../utils/jwtHelper")
const {addSecurity, getAllSecurity} = require("../controller/securityController")

security = express.Router()

security.post("/create", addSecurity )
security.get("/readall", getAllSecurity)
module.exports = security