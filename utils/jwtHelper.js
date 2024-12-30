
const jwt = require("jsonwebtoken")
const Status = require("../constant")

const secret_key = process.env.SECRETKEY

const roles = {

    "admin": ["create", "read", "update", "delete", "readall"],
    "security":["read", "readall"],
    "warden": ["read", "readall"],
    "student": ["read"],

}



const generateToken = (payload, expiresIn) => {
    payload = {...payload, salt: Date.now()}
    return jwt.sign(payload, secret_key, {expiresIn})
}

const verfiyToken = (token) => {
    try {
        return jwt.verify(token, secret_key);
    } catch(error) {
        throw new Error(error.message)
    }
}


const authorize = (permission) => {
    return (req, res, next) => {

        // console.log(req.headers)
        if(!req?.headers?.authorization) {
            res.status(Status.UNAUTHORIZED)
            throw new Error("Unauthorized access to the API")
        }
        const token = req?.headers?.authorization.split(" ")[1]
        // console.log(token)
        const obj = verfiyToken(token)
        // console.log("Object: ",obj)
        // console.log("roles: ", roles[obj.user_type].includes(permission))
      
        if(!roles[obj.user_type].includes(permission)) {
            
            res.status(Status.UNAUTHORIZED)
            throw new Error("unauthroized access to the API")
        }
        req.body.auth_user_id = obj._id;
        console.log("Authorzied :", obj.user_type)
        next()
    }
}

module.exports = {generateToken, verfiyToken, authorize}