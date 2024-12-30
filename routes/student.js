const express = require("express")
const {addStudent, getStudentById, getStudentByEmail, updateStudent, deleteOne, getAllStudent, getAllStudentDept, updateStudentBySession} = require("../controller/studentController")
const { authorize } = require("../utils/jwtHelper")

const student = express.Router()

student.post("/create",  addStudent)
student.get("/get/id/:login_id", getStudentById)
student.get("/get/email/:email", getStudentByEmail)
student.put("/update", updateStudentBySession)
student.put("/update/:email_id", updateStudent)
student.delete("/delete/:stud_id", authorize("delete"), deleteOne)
student.get("/getall", authorize("readall"), getAllStudent)
student.get("/getall/:department", authorize("readall"), getAllStudentDept)

module.exports = student