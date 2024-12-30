const express = require("express")
const {authorize} = require("../utils/jwtHelper")
const {addSecurity} = require("../controller/securityController")

security = express.Router()

security.post("/create", addSecurity )

module.exports = security