const Status = require("../constant")

const errorHandler = (err, req, res, next) => {

    let statuscode = res.statusCode ? res.statusCode : 500;

    console.log(err.stack)

    let title = ""
    let message = ""

    switch (statuscode) {

        case Status.VALIDATION_ERROR:

            title = "Validation Failed"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Status.UNAUTHORIZED:

            title = "Unauthorized Access"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Status.NOT_FOUND:

            title = "Not Found"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Status.FORBIDDEN:

            title = "Forbidden"
            message = err.message.split(":")[err.message.split(":").length-1].trim()

            break;

        case Status.SERVER_ERROR:
            title = "Server Error"
            message = err.message.split(":")[err.message.split(":").length-1].trim()
            break;

        default:
            statuscode = 500
            title = "Server Error"
            message = err.message;
            break
    }

    return res.errorResponse(statuscode, title, message)
}

module.exports = errorHandler