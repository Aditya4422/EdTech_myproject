const nodemailer = require("nodemailer");  

require("dotenv").config();

// this function of utils is being utilized by our prehook middleware for sending the otp through mail
const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            secure: false,
        });

        let info = await transporter.sendMail({
            from: 'StudyNotion',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log(info);
        return info;
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender;