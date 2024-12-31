const express = require("express")
const {authorize} = require("../utils/jwtHelper")
const {addSecurity, getAllSecurity, getSecurity, getSecurityByLoginId, updateSecurity, updateSecurityByLoginId, deleteSecurityByLoginId} = require("../controller/securityController")


security = express.Router()

security.post("/create", addSecurity )

security.get("/readall", authorize("readall"), getAllSecurity)
security.get("/read", getSecurity)
security.get("/read/login/:loginId", getSecurityByLoginId)

security.put("/update", updateSecurity)
security.put("/update/login/:loginId", updateSecurityByLoginId)

security.delete("/delete/login/:loginId", authorize("delete"), deleteSecurityByLoginId)
module.exports = security