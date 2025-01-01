const QRcode = require("qrcode")

const generateQRCode = async(token) =>{
    try {
        const qrCodeDataUrl = await QRcode.toDataURL(token)
        return qrCodeDataUrl
    } catch(err) {
        throw new Error("Error generating QR code")
    }
}

module.exports = generateQRCode