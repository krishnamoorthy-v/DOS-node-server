const trycatch = require("../utils/TryCatch")
const LoginModel = require("../Models/LoginModel")
const PasswordResetModel = require("../Models/PasswordResetModel")
const sendMail = require("../Service/MailService")
const statuscode = require("../constant")
const mongoose = require("mongoose")
const { generateToken } = require("../utils/jwtHelper")
const Constant = require("../constant")
const TryCAtch = require("../utils/TryCatch")

//@descr Sign up
//@route POST /signup
//@access public

const signup = trycatch(async (req, res) => {

    const { email, username, password, is_active, user_type } = req.body
    // console.log( {email, username, password, is_active, user_type} )

    const login = new LoginModel({ email, username, password, is_active, user_type })
    try {

        let result = await login.save();
        console.log("result: ", result);

        return res.status(statuscode.SUCCESS).json({ "Success": "account created successfully", "message": result })
    } catch (err) {
        res.status(statuscode.NOT_FOUND)
        throw err
    }
})

//@descr login 
//@route POST /login
//@access public

const login = trycatch(async (req, res) => {

    const { email, password } = req.body;
    const login = await LoginModel.findOne({ email })
    const token = generateToken({_id: login._id, user_type: login.user_type}, "7d")
    
    console.log(await login.isValidPassword(password))
    
    if (await login.isValidPassword(password)) {
        console.log("Login: ", login)
        req.session.userId = login._id
        console.log("Session UserId: ", req.session.userId)
        return res.status(statuscode.SUCCESS).json({ "Success": "login success", "message": login, "token": token })
    } else {
        res.status(statuscode.UNAUTHORIZED)
        throw new Error("Invalid username or password")
    }

})


//@descr sesssion based login
//@route GET /login
//@access public
const sessionLogin = TryCAtch( async(req, res)=> {
    const _id = req.session.userId;
    console.log(_id)
    if(!_id) {
        res.status(statuscode.UNAUTHORIZED)
        throw new Error("session expired")
    }
    const result = await LoginModel.findOne({_id})
    const token = generateToken({_id: login._id, user_type: login.user_type}, "7d")
    return res.status(statuscode.SUCCESS).json({"Success": "Login successfully", "message": result, token})

})


//@descr sesssion log out
//@route delete /logout
//@access public

const sessionLogout = TryCAtch( async(req, res)=> {
    req.session.destroy( (error)=>{
        if(error) {
            res.status(statuscode.SERVER_ERROR)
            throw new Error("Failed to logout")
        }
    })
    return res.status(statuscode.SUCCESS).json({"Success": "Logout successfully"})

})

//@descr password reset link to email
//@route POST password/reset
//@access public

const passwordResetEmail = trycatch(async (req, res) => {

    const { email } = req.body;
    try {
        const user = await LoginModel.findOne({ email })
        if (!user) {
            res.status(statuscode.NOT_FOUND)
            throw new Error("Email is not registerd one")
        }
        const reset_info = await PasswordResetModel.generateToken(email);

        const url = `http://192.168.63.110:3000/account/auth/reset/${reset_info.token}`

        sendMail(reset_info?.email, url)
            .then(() => {
                console.log("password reset: ", reset_info)
                return res.status(statuscode.SUCCESS).json({ "Success": "check you email", "message": reset_info })
            })
            .catch((error) => {
                res.status(statuscode.NOT_FOUND)
                throw error;
            })


    } catch (error) {
        if (res.statusCode == statuscode.SUCCESS) {
            res.status(statuscode.NOT_FOUND)
        }
        console.log(res.statusCode)
        throw error
    }
})


//@descr password reset verify
//@route POST password/reset/confirm
//@access public

const passwordReset = trycatch(async (req, res) => {

    const { password, confirm_password } = req.body;
    const { token } = req.params

    if (password != confirm_password) {
        res.status(statuscode.VALIDATION_ERROR)
        throw new Error(" password and confirm password are not same")
    }

    try {
        const result = await PasswordResetModel.verifyToken(token);
        // console.log(result)
        const update = await LoginModel.findOne({email: result?.properties?.email})
        update.password = password
        await update.save()
        console.log(update)
        // console.log(statuscode.SUCCESS)
        return res.status(statuscode.SUCCESS).json({ "Success": "Password Reset", "message": result })
    } catch (error) {
        res.status(statuscode.VALIDATION_ERROR)
        throw error
    }
})


//@descr delete the user based on the user id
//@route POST delete/user/:userid
//@access delete

const deleteUser = trycatch( async (req, res)=> {

    const {userid} = req.params 
    try {
        

        // to check the user id and auth id are same to authorize
        if(userid != req.body.auth_user_id) {
            res.status(Constant.UNAUTHORIZED)
            throw new Error("Unauthorized access of auth id and login id")
        }
        
        const result = await LoginModel.deleteOne({_id: userid})

        console.log(result) 
        
        if(!result) {
            res.status(statuscode.NOT_FOUND)
            throw new Error("User not found")
        }
        return res.status(statuscode.SUCCESS).json({"Success": "Data deleted successfully", "message": result})

    } catch(error) {
        if (res.statusCode == statuscode.SUCCESS) {
            res.status(statuscode.SERVER_ERROR)
        }
        console.log(res.statusCode)
        throw error;
    }
})

module.exports = { signup, login, passwordResetEmail, passwordReset, deleteUser, sessionLogin, sessionLogout }