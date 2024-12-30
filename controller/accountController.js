const trycatch = require("../utils/TryCatch")
const LoginModel = require("../Models/LoginModel")
const PasswordResetModel = require("../Models/PasswordResetModel")
const sendMail = require("../Service/MailService")
const Status = require("../constant")
const mongoose = require("mongoose")
const { generateToken } = require("../utils/jwtHelper")
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
        // return res.status(Status.SUCCESS).json({ "Success": "account created successfully", "message": result })
        return res.Response(Status.SUCCESS, "signup successfully", result)
    
    } catch (err) {
        res.status(Status.NOT_FOUND)
        throw err
    }
})

//@descr login 
//@route POST /login
//@access public

const login = trycatch(async (req, res) => {

    const { email, password } = req.body;
    const login = await LoginModel.findOne({ email })
    if(!login) {
        res.status(Status.NOT_FOUND)
        throw new Error("User not found")
    }
    const token = generateToken({_id: login._id, user_type: login.user_type}, "7d")
    
    console.log(await login.isValidPassword(password))
    
    if (await login.isValidPassword(password)) {
        // console.log("Login: ", login)
        req.session.userId = login._id
        // console.log("Session UserId: ", req.session.userId)
        // return res.status(Status.SUCCESS).json({ "Success": "login success", "message": login, "token": token })
        let userLogin = login.toJSON()
        userLogin["token"] = token
        // console.log(userLogin)
        return res.Response(Status.SUCCESS, "login Successfully", userLogin)
    } else {
        res.status(Status.UNAUTHORIZED)
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
        res.status(Status.UNAUTHORIZED)
        throw new Error("session expired")
    }
    const result = await LoginModel.findOne({_id})
    const token = generateToken({_id: login._id, user_type: login.user_type}, "7d")
    let userLogin = result.toJSON()
    userLogin["token"] = token
    // return res.status(Status.SUCCESS).json({"Success": "Login successfully", "message": result, token})
    res.Response(Status.SUCCESS, "Login successfully", userLogin)
})


//@descr sesssion log out
//@route delete /logout
//@access public

const sessionLogout = TryCAtch( async(req, res)=> {
    req.session.destroy( (error)=>{
        if(error) {
            res.status(Status.SERVER_ERROR)
            throw new Error("Failed to logout")
        }
    })
    // return res.status(Status.SUCCESS).json({"Success": "Logout successfully"})
    return res.Response(Status.SUCCESS, "Logout successfully")

})

//@descr password reset link to email
//@route POST password/reset
//@access public

const passwordResetEmail = trycatch(async (req, res) => {

    const { email } = req.body;
    try {
        const user = await LoginModel.findOne({ email })
        if (!user) {
            res.status(Status.NOT_FOUND)
            throw new Error("Email is not registerd one")
        }
        const reset_info = await PasswordResetModel.generateToken(email);

        const url = `${process.env.FRONT_IP}/account/auth/reset/${reset_info.token}`

        sendMail(reset_info?.email, url)
            .then(() => {
                console.log("password reset: ", reset_info)
                // return res.status(Status.SUCCESS).json({ "Success": "check you email", "message": reset_info })
                return res.Response(Status.SUCCESS, "check your email")
            })
            .catch((error) => {
                res.status(Status.NOT_FOUND)
                throw error;
            })


    } catch (error) {
        if (res.Status == Status.SUCCESS) {
            res.status(Status.NOT_FOUND)
        }
        console.log(res.Status)
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
        res.status(Status.VALIDATION_ERROR)
        throw new Error(" password and confirm password are not same")
    }

    try {
        const result = await PasswordResetModel.verifyToken(token);
        // console.log(result)
        const update = await LoginModel.findOne({email: result?.properties?.email})
        update.password = password
        await update.save()
        console.log(update)
        // console.log(Status.SUCCESS)
        // return res.status(Status.SUCCESS).json({ "Success": "Password Reset", "message": result })
        return res.Response(Status.SUCCESS, "Password Reset Successfully")
    } catch (error) {
        res.status(Status.VALIDATION_ERROR)
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
            res.status(Status.NOT_FOUND)
            throw new Error("User not found")
        }
        // return res.status(Status.SUCCESS).json({"Success": "Data deleted successfully", "message": result})
        return res.Response(Status.SUCCESS, "Deleted successfully")
        
    } catch(error) {
        if (res.Status == Status.SUCCESS) {
            res.status(Status.SERVER_ERROR)
        }
        console.log(res.Status)
        throw error;
    }
})

module.exports = { signup, login, passwordResetEmail, passwordReset, deleteUser, sessionLogin, sessionLogout }