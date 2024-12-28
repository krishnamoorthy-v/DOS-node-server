const Constant = require("../constant")

const errorHandler = (err, req, res, next) => {

    const statuscode = res.statusCode ? res.statusCode : 500;

    console.log(err.stack)

    let title = ""
    let message = ""

    switch (statuscode) {

        case Constant.VALIDATION_ERROR:

            title = "Validation Failed"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Constant.UNAUTHORIZED:

            title = "Unauthorized Access"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Constant.NOT_FOUND:

            title = "Not Found"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Constant.FORBIDDEN:

            title = "Forbidden"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Constant.SERVER_ERROR:
            title = "Server Error"
            message = err.message.split(":")[err.message.split(":").length-1].trim()
            break;

        default:
            title = "Success"
            message = "No Error, All good!";
            break
    }

    return res.json({ title, message })
}

module.exports = errorHandler