const TryCAtch = require("../utils/TryCatch")
const StudentModel = require("../Models/StudentModel")
const constant = require("../constant")
const mongoose = require("mongoose")

//@descr create student 
//@route POST /create
//@access public

const addStudent = TryCAtch(async (req, res) => {

    const { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr } = req.body
    const obj = { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr }
    obj.login = req.session.userId;
    const student_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))

    try {
        // console.log(student_info)
        let student = new StudentModel(student_info)
        const result = await student.save()
        res.status(constant.SUCCESS).json({ "Success": "student added", "message": result })

    } catch (error) {
        res.status(constant.VALIDATION_ERROR)
        throw error
    }
})

//@descr get student info based on login id
//@route GET /get/id/<login id>
//@access public

const getStudentById = TryCAtch(async (req, res, next) => {

    const { login_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(login_id)) {
        res.status(constant.NOT_FOUND)
        throw new Error("Invalid login Id")
    }
    const student = await StudentModel.findOne({ login: login_id }).populate("login")
    if (!student) {
        res.status(constant.NOT_FOUND);
        throw new Error("student info not exits for particular login id")
    }
    return res.status(constant.SUCCESS).json({ "Success": "student info", "message": student })

})


//@descr GET Student by email id
//@route GET get/email/< email id>
//@access public

const getStudentByEmail = TryCAtch(async (req, res, next) => {

    const { email } = req.params

    const students = await StudentModel.find().populate("login").exec();

    // console.log(students)

    const filtered = students.filter(student => {
        // console.log(student)
        return student.login && student.login.email === email
    })
    console.log(filtered)

    if (filtered.length == 0) {
        res.status(constant.NOT_FOUND);
        throw new Error("student info not exits for particular email id")
    }
    return res.status(constant.SUCCESS).json({ "Success": "student info", "message": filtered })

})

//@descr UPDATE Student by login id
//@route PUT update
//@access public

const updateStudent = TryCAtch(async (req, res) => {

    const { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr } = req.body
    const obj = { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr }
    const student_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))

    const login = req.session.userId

    console.log(login)
    if (!login) {
        res.status(constant.UNAUTHORIZED)
        throw new Error("Session expired ")
    }

    const updateInfo = await StudentModel.updateOne(
        { login },
        { $set: student_info },
        { new: true, runValidators: true }
    );

    console.log(updateInfo)

    return res.status(constant.SUCCESS).json({ "Success": "user updated" })
})

//@descr DELETE Student by login id
//@route DELETE delete/id
//@access public

const deleteOne = TryCAtch( async(req, res)=>{

    const {stud_id} = req.params 
    if (!mongoose.Types.ObjectId.isValid(stud_id)) {
        res.status(constant.NOT_FOUND)
        throw new Error("Invalid stud Id")
    }

    const status = await StudentModel.deleteOne({_id: stud_id})
    console.log(status)
    if(status.deletedCount == 0) {
        res.status(constant.NOT_FOUND)
        throw new Error("student id not exits")
    }
    return res.status(constant.SUCCESS).json({"Success": "Deleted"})

})


//@descr GET all students
//@route GET getall
//@access public

const getAllStudent = TryCAtch( async(req, res)=>{

    const students = await StudentModel.find()
    if(students.length == 0) {
        res.status(constant.NOT_FOUND)
        throw new Error("Students not found");
    }
    return res.status(constant.SUCCESS).json({"Success": "All students retrieved", message: students})
})


//@descr GET all students based on department
//@route GET getall/department
//@access public

const getAllStudentDept = TryCAtch( async(req, res)=> {

    const {department} = req.params;
    const students = await StudentModel.find({department});
    if(students.length == 0) {
        res.status(constant.NOT_FOUND)
        throw new Error("Department not found")
    }
    return res.status(constant.SUCCESS).json({"Success": "All student of dept are retrived", message: students})

})

module.exports = { addStudent, getStudentById, getStudentByEmail, updateStudent, deleteOne, getAllStudent, getAllStudentDept }