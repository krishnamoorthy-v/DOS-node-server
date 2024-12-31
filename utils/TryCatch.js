
const TryCAtch = (controller) => async (req, res, next) => {
    try {
        // console.log("controllers called")
        await controller(req, res);
    } catch(error) {
        next(error)
    }
}

module.exports = TryCAtch