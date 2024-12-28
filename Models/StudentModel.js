const mongoose = require("mongoose")
const DefaultValue = require("../utils/DefaultValue")
student_schema = mongoose.Schema({

    name: { type: String },
    mobile: { type: String, require: [true, "Parent mobile number required"], unique: [true, "mobile number must be unique"], match: [/^[6-9]\d{9}$/, "Invalid mobile number"] },
    profile: { type: String, default: DefaultValue.profileImage() },
    department: { type: String, require: [true, "Department field required"], lowercase: true },
    parent_name: { type: String, require: [true, "Parent Name required"] },
    parent_mobile: { type: String, require: [true, "Parent mobile number required"], match: [/^[6-9]\d{9}$/, "Invalid mobile number" ] },
    guardian_name: { type: String },
    guardian_mobile: { type: String, match: [/^[6-9]\d{9}$/, "Invalid mobile number" ] },
    home_addr: { type: String },
    login: { type: mongoose.Types.ObjectId, ref: "LoginModel" }

})


const StudentModel = mongoose.model("StudentModel", student_schema)
module.exports = StudentModel;