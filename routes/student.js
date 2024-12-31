const express = require("express")
const {addStudent, getStudentById, getStudentByEmail, updateStudent, deleteOne, getStudent, getAllStudent, getAllStudentDept, updateStudentBySession} = require("../controller/studentController")
const { authorize } = require("../utils/jwtHelper")

const student = express.Router()

student.post("/create",  addStudent)

student.get("/read", getStudent)
student.get("/get/id/:login_id", getStudentById)
student.get("/get/email/:email", getStudentByEmail)
student.get("/getall", authorize("readall"), getAllStudent)
student.get("/getall/:department", authorize("readall"), getAllStudentDept)


student.put("/update", updateStudentBySession)
student.put("/update/:email_id", updateStudent)

student.delete("/delete/:stud_id", authorize("delete"), deleteOne)


module.exports = student