const TryCAtch = require("../utils/TryCatch")
const Status = require("../constant")
const SecurityModel = require("../Models/SecurityModel")
const mongoose = require("mongoose")

//@descr create Security 
//@route POST /create
//@access public

const addSecurity = TryCAtch( async(req, res)=>{

    const {name, profile, login, primary_number, secondary_number} = req.body
    obj = {name, profile, login, primary_number, secondary_number}
    const security_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))
    
    try {
        if(login && !mongoose.Types.ObjectId.isValid(login)) {
            throw new Error("Invalid Login Id")
        }
        console.log(security_info)
        const result = await SecurityModel(security_info)
        await result.save()
        return res.Response(Status.SUCCESS, "Security info added", result);
    } catch(error) {
        res.status(Status.VALIDATION_ERROR)
        throw error
    }
})

//@descr to get all Security info
//@route POST /
//@access public

const getAllSecurity = TryCAtch( async(req, res)=> {

    const result = await SecurityModel.find()
    if(result.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    res.Response(Status.SUCCESS, "Retrived Security info Succefully", result)
})


//@descr to get Security by email id
//@route POST /
//@access public

const getByEmail = TryCAtch( async(req, res)=> {
    
})
module.exports = {addSecurity, getAllSecurity}