const crypto = require("crypto")

const generateCryptoToken = function(){

    const token = crypto.randomBytes(32).toString('hex')
    return token
}

module.exports = {generateCryptoToken}