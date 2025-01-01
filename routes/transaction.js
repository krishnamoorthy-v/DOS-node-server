const express = require("express")
const {authorize} = require("../utils/jwtHelper")
const {createTransaction, getALL, getOneStudAllTran, generateQr, updateStatus, verifyQr}  = require("../controller/transactionController")


transaction = express.Router()

transaction.post("/create", createTransaction)
transaction.post("/qrcode/verify", authorize("security"), verifyQr)

transaction.get("/readall", authorize("readall"), getALL)
transaction.get("/stud/read", getOneStudAllTran)
transaction.get("/qrcode/generating/:t_id", generateQr)

transaction.put("/warden/update/:t_id/:status", authorize("warden"), updateStatus)

module.exports= transaction