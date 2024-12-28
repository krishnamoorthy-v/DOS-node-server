
const nodemailer = require("nodemailer");
const EMAIL_SECRET_KEY = process.env.EMAIL_SECRET_KEY;

let transporter = nodemailer.createTransport( {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "digitaloutpasssystem@gmail.com",
        pass: EMAIL_SECRET_KEY
    }
});



const sendMail = (email, info) =>{
    return new Promise( (resolve, reject) => {

        transporter.sendMail( {

            from: "digitaloutpasssystem@gmail.com",
            to: email,
            subject: "Digital Outpass system Password Reset Link:",
            html: `<h4> link will expires in 1 hour from generated time: <a href="${info}">click to reset</a> </h4>`
    
        }, (error, info) => {
            if(error) {
                reject( {status: false, error: error});
            } else {
                resolve( {status: true, info: info.response });
            }
        })


    })
    
}

module.exports = sendMail;