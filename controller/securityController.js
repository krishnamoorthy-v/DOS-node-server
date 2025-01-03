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
//@route GET /readall
//@access public

const getAllSecurity = TryCAtch( async(req, res)=> {

    const result = await SecurityModel.find()
    if(result.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    res.Response(Status.SUCCESS, "Retrived Security info Succefully", result)
})



//@descr to get Security by session id
//@route GET /read
//@access public

const getSecurity = TryCAtch( async(req, res)=> {

    // console.log(req.session)
    const login = req.session?.loginId;
    console.log(login)
    if(!login) {
        res.status(Status.NOT_FOUND)
        throw new Error("Session id not found")
    }
    const result = await SecurityModel.findOne({login})
    if(!result) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    return res.Response(Status.SUCCESS, "Retrived Security info Successfully", result)

})

//@descr to get Security by session id
//@route GET /read/login/<id>
//@access public

const getSecurityByLoginId = TryCAtch( async(req, res)=> {

    // console.log(req.session)
    const {loginId} = req.params
    console.log(loginId)
    if(!mongoose.Types.ObjectId.isValid(loginId)) {
        res.status(Status.VALIDATION_ERROR)
        throw new Error("Invalid login id")
    }
    const result = await SecurityModel.findOne({login: loginId})
    if(!result) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    return res.Response(Status.SUCCESS, "Retrived Security info Successfully", result)

})

//@descr to get Security by email id
//@route GET /read/email/<email id>
//@access public

const getSecurityByEmail = TryCAtch( async(req, res)=>{

    const {email_id} = req.params;
    const result = await SecurityModel.find().populate("login")
    filtered = result.filter( doc => doc.login && doc.login.email === email_id)
    if(filter.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    return res.Response(Status.SUCCESS, "Retrived Security info Successfully", filtered)
})

//@descr to update Security by session id
//@route UPDATE /update
//@access public

const updateSecurity = TryCAtch( async(req, res)=> {

    const {name, profile, login, primary_number, secondary_number} = req.body
    obj = {name, profile, login, primary_number, secondary_number}
    const security_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))
    
    const loginId = req.session.loginId;
    console.log(loginId)
    if(!loginId) {
        res.status(Status.NOT_FOUND)
        throw new Error("Session id not found")
    }
    const result = await SecurityModel.updateOne({login: loginId}, {$set: security_info})
    
    if(result.modifiedCount == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    
    console.log(result)
    return res.Response(Status.SUCCESS, "Data updated")

})

//@descr to update Security by login id
//@route UPDATE /update/login/<id>
//@access public

const updateSecurityByLoginId = TryCAtch( async(req, res)=> {

    const {name, profile, login, primary_number, secondary_number} = req.body
    obj = {name, profile, login, primary_number, secondary_number}
    const security_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))
    
    const {loginId} = req.params
    if(!mongoose.Types.ObjectId.isValid(loginId)) {
        res.status(Status.VALIDATION_ERROR)
        throw new Error("Invalid login id")
    }
    const result = await SecurityModel.updateOne(
        {login: loginId}, 
        {$set: security_info},
        {runValidators: true }
    )
    if(result.modifiedCount == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    console.log(result)
    return res.Response(Status.SUCCESS, "Data updated")

})

//@descr to UPDATE Security by email id
//@route UPDATE /update/email/<email-id>
//@access public

const updateSecurityByEmail = TryCAtch( async(req, res)=>{

    const {name, profile, login, primary_number, secondary_number} = req.body
    obj = {name, profile, login, primary_number, secondary_number}
    const security_info = Object.fromEntries(Object.entries(obj).filter(([key, value]) => { if (value != undefined) return key }))

    const {email} = req.params;
    const result = await SecurityModel.find().populate("login")
    
    const filtered = result.filter( doc => doc.login && doc.login.email === email)
    if(filtered.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user found")
    }
    await SecurityModel.updateOne({_id: filtered._id}, {$set: {security_info}})
    return res.Response(Status.SUCCESS, "Data Updated")
    
})

//@descr to DELETE Security by session id
//@route DELETE /delete
//@access public

const deleteSecurity = TryCAtch( async(req, res)=> {

    const {loginId} = req.session.loginId;
    if(!loginId) {
        res.status(Status.NOT_FOUND)
        throw new Error("Session id not found")
    }

    const result = await SecurityModel.deleteOne({login: loginId})
    if(result.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user Found")
    }
    return res.Response(Status.SUCCESS, "Data Deleted")
})

//@descr to DELETE Security by login id
//@route DELETE /delete/login/<id>
//@access public

const deleteSecurityByLoginId = TryCAtch( async(req, res)=> {

    const {loginId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(loginId)) {
        res.status(Status.VALIDATION_ERROR)
        throw new Error("Invalid login id")
    }

    const result = await SecurityModel.deleteOne({login: loginId})
    if(result.length == 0) {
        res.status(Status.NOT_FOUND)
        throw new Error("No user Found")
    }
    return res.Response(Status.SUCCESS, "Data Deleted")
})



module.exports = {addSecurity, getAllSecurity, getSecurity, getSecurityByLoginId, updateSecurity, updateSecurityByLoginId, deleteSecurityByLoginId}