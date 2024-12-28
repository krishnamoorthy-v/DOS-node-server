const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

login_schema = mongoose.Schema( {

    email: {type: String, required: [true, "email id required"], unique: [true, "Email id alredy exits"], match: [/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z.]{2,}$/, "invalid email id"]},
    password: {type: String, required: [true, "password requried"]},
    is_active: {type: Boolean, default: true},
    user_type: {type: String, enum: ["warden", "security", "student", "admin"], default: "student"}
}, {
    timestamps: true,
})

login_schema.pre("save", async function(next){

    let salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

login_schema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

LoginModel = mongoose.model("LoginModel", login_schema);
module.exports = LoginModel;