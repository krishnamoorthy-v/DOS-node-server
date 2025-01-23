const mongoose = require("mongoose")
const { generateCryptoToken } = require("../utils/TokenUtils")

reset_schema = new mongoose.Schema({

    email: { type: String, unique: [true, "email id already exits"], required: true, match: [/^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z.]{2,}$/, "invalid email id"] },
    token: { type: String }
}, {
    timestamps: true
})

reset_schema.statics.generateToken = async function (email) {

    try {
        const token = await generateCryptoToken(email);

        const res = await this.findOne({ email })
        if (res) {
            await this.updateOne({ _id: res._id }, { $set: { token } })
        } else {
            await this.create({ email, token });
        }
        return { email, token }

    } catch (error) {
        throw new Error("Failed to generate token: ", error.message)
    }
}

reset_schema.statics.verifyToken = async function(token) {

    try {
        const res = await this.findOne({token})
        console.log( "verify token ", ( ( Date.now() - new Date(res.updatedAt)) < 1000*60*60))

        if( (token == res.token) && (( Date.now() - new Date(res.updatedAt)) < 1000*60*60)) {
            return {properties: {email: res.email},message: "token verified successfully"}
        } else {
            throw new Error("Token Invalid or Expired")
        }
    } catch(error) {
        throw new Error(error.message)
    }
}

const passwordResetEmail = mongoose.model("PasswordReset", reset_schema);

module.exports = passwordResetEmail