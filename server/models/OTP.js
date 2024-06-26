const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require('../mail/templates/emailVerificationTemplate');

const OTPSchema = mongoose.Schema({
    email: {
         type: String,
         required: true,
         trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 10*60,
    },
});

// we have to write our sendingemail function and pre-save hook function between the otpSchema and module.exports
// first create a transporter to send email
// second define the email options
// third send the email
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Please use the the OTP for the verification ", emailTemplate(otp));
        console.log("Email sent successfully: ", mailResponse.response);
    }
    catch(error){
        console.log("Error occured while sending the otp: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);