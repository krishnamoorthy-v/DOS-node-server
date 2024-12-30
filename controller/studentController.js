const TryCAtch = require("../utils/TryCatch")
const StudentModel = require("../Models/StudentModel")
const Status = require("../constant")
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
        // res.status(Status.SUCCESS).json({ "Success": "student added", "message": result })
        return res.Response(Status.SUCCESS, "Student added successfully", result)
    } catch (error) {
        res.status(Status.VALIDATION_ERROR)
        throw error
    }
})

//@descr get student info based on login id
//@route GET /get/id/<login id>
//@access public

const getStudentById = TryCAtch(async (req, res, next) => {

    const { login_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(login_id)) {
        res.status(Status.NOT_FOUND)
        throw new Error("Invalid login Id")
    }
    const student = await StudentModel.findOne({ login: login_id }).populate("login")
    if (!student) {
        res.status(Status.NOT_FOUND);
        throw new Error("student info not exits for particular login id")
    }
    // return res.status(Status.SUCCESS).json({ "Success": "student info", "message": student })
    return res.Response(Status.SUCCESS, "Student info", student)
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
        res.status(Status.NOT_FOUND);
        throw new Error("student info not exits for particular email id")
    }
    // return res.status(Status.SUCCESS).json({ "Success": "student info", "message": filtered })
    return res.Response(Status.SUCCESS, "Student info", filtered)
})


//@descr GET all students
//@route GET getall
//@access public

const getAllStudent = TryCAtch(async (req, res) => {

    console.log("From Get all student")
    const students = await StudentModel.find()
    if (students.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("Students not found");
    }
    // return res.status(Status.SUCCESS).json({"Success": "All students retrieved", message: students})
    return res.Response(Status.SUCCESS, "All students are retrieved", students)

})


//@descr GET all students based on department
//@route GET getall/department
//@access public

const getAllStudentDept = TryCAtch(async (req, res) => {

    const { department } = req.params;
    const students = await StudentModel.find({ department });
    if (students.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("Department not found")
    }
    // return res.status(Status.SUCCESS).json({"Success": "All student of dept are retrived", message: students})
    return res.Response(Status.SUCCESS, "All student of dept are retrived", students)
})

//@descr UPDATE Student by login id
//@route PUT update
//@access public

const updateStudent = TryCAtch(async (req, res) => {

    const { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr } = req.body
    const obj = { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr }
    const student_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))

    const { email_id } = req.params

    // console.log(email_id)
    if (!email_id) {
        res.status(Status.VALIDATION_ERROR)
        throw new Error("email id required to find")
    }

    const updateInfo = await StudentModel.find().populate("login").exec();

    const filtered = updateInfo.filter(doc => doc.login && doc.login.email === email_id)
    // console.log(filtered)

    if (filtered.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("Student not found")
    }
    const result = await StudentModel.updateOne(
        { _id: filtered[0]._id },
        { $set: student_info },
        { new: true, runValidators: true }
    )
    console.log(result)
    // return res.status(Status.SUCCESS).json({ "Success": "user updated" })
    return res.Response(Status.SUCCESS, "User updated")
})


//@descr UPDATE Student by login session id
//@route PUT update
//@access public

const updateStudentBySession = TryCAtch(async (req, res) => {

    const { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr } = req.body
    const obj = { name, mobile, profile, department, parent_name, parent_mobile, guardian_name, guardian_mobile, home_addr }
    const student_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))

    const login = req.session.userId

    console.log(login)
    if (!login) {
        res.status(Status.UNAUTHORIZED)
        throw new Error("Session expired ")
    }

    const updateInfo = await StudentModel.updateOne(
        { login },
        { $set: student_info },
        { new: true, runValidators: true }
    );

    console.log(updateInfo)

    // return res.status(Status.SUCCESS).json({ "Success": "user updated" })
    return res.Response(Status.SUCCESS, "User updated")
})

//@descr DELETE Student by login id
//@route DELETE delete/id
//@access public

const deleteOne = TryCAtch(async (req, res) => {

    const { stud_id } = req.params
    if (!mongoose.Types.ObjectId.isValid(stud_id)) {
        res.status(Status.NOT_FOUND)
        throw new Error("Invalid stud Id")
    }

    const status = await StudentModel.deleteOne({ _id: stud_id })
    console.log(status)
    if (status.deletedCount == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("student id not exits")
    }
    // return res.status(Status.SUCCESS).json({"Success": "Deleted"})
    return res.Response(Status.SUCCESS, "Deleted Successfully")
})




module.exports = { addStudent, getStudentById, getStudentByEmail, updateStudent, deleteOne, getAllStudent, getAllStudentDept, updateStudentBySession }