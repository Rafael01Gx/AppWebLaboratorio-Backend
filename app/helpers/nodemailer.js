const  nodemailer = require('nodemailer')

const config = require('../../config')

const transporter = nodemailer.createTransport({
    host: config.mail_HOST,
    port: config.mail_PORT,
    auth:{
        user: config.mail_USER,
        pass: config.mail_PASS
    }
})

const sendMail = (to,subject,email_body)=>{
transporter.sendMail({
    from: config.mail_FROM,
    to:to,
    subject: subject,
    html: email_body
})
}

module.exports = sendMail