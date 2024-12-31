const express = require("express")
const {authorize} = require("../utils/jwtHelper")
const {addWarden, getAllWarden, getWarden, getWardenByLoginId, updateWarden, updateWardenByLoginId, deleteWardenByLoginId} = require("../controller/wardenController")


warden = express.Router()

warden.post("/create", addWarden )

warden.get("/readall", authorize("readall"), getAllWarden)
warden.get("/read", getWarden)
warden.get("/read/login/:loginId", getWardenByLoginId)

warden.put("/update", updateWarden)
warden.put("/update/login/:loginId", updateWardenByLoginId)

warden.delete("/delete/login/:loginId", authorize("delete"), deleteWardenByLoginId)
module.exports = warden