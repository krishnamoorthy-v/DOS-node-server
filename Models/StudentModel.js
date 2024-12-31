const mongoose = require("mongoose")
const DefaultValue = require("../utils/DefaultValue")
student_schema = mongoose.Schema({

    name: { type: String },
    mobile: { type: String, required: [true, "Parent mobile number required"], unique: [true, "mobile number must be unique"], match: [/^[6-9]\d{9}$/, "Invalid mobile number"] },
    profile: { type: String, default: DefaultValue.profileImage() },
    department: { type: String, required: [true, "Department field required"], lowercase: true },
    parent_name: { type: String, required: [true, "Parent Name required"] },
    parent_mobile: { type: String, required: [true, "Parent mobile number required"], match: [/^[6-9]\d{9}$/, "Invalid mobile number" ] },
    guardian_name: { type: String },
    guardian_mobile: { type: String, match: [/^[6-9]\d{9}$/, "Invalid mobile number" ] },
    home_addr: { type: String },
    login: { type: mongoose.Types.ObjectId, 
        ref: "LoginModel", 
        require: [true, "Login id required"],
        validate: {
            validator: async function (value) {

                const login = await LoginModel.findById(value)
                if (!login) {
                    throw new Error("Referenced login id not exits")
                }

                if (login.user_type != "student") {
                    throw new Error("Referenced Login_user type is not a Student")
                }
            }
        }
    }

})


const StudentModel = mongoose.model("StudentModel", student_schema)
module.exports = StudentModel;