const mongoose = require("mongoose")
const Default = require("../utils/DefaultValue")

security_schema = mongoose.Schema({

    profile: { type: String, default: Default.profileImage() },
    name: { type: String },
    primary_number: { type: String, required: [true, "mobile number required"], match: [/^[6-9]\d{9}$/, "Invalid mobile number"], unique: [true, "mobile number already exits"] },
    secondary_number: { type: String, match: [/^[6-9]\d{9}$/, "Invalid mobile number"] },
    login: {
        type: mongoose.Types.ObjectId,
        ref: "LoginModel",
        required: [true, "login id is required"],
        unique: [true, "security already exits for the login id"],
        validate: {
            validator: async function (value) {

                const login = await LoginModel.findById(value)
                if (!login) {
                    throw new Error("Referenced login id not exits")
                }

                if (login.user_type != "security") {
                    throw new Error("Referenced Login_user type is not a Security")
                }
            }
        }
    }

})

const SecurityModel = mongoose.model("securitymodel", security_schema)
module.exports = SecurityModel