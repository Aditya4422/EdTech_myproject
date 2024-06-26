const { contactUsEmail } =  require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender")

exports.contactUsController = async (req, res) => {
    const {email, firstname, lastname, message, phoneNo, countrycode} = req.body;
    console.log(req.body);
    try{
        const emailResponse = await mailSender(
            email,
            "Your Data sent successfully",
            contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode),
        );

        console.log("This is the email response : ", emailResponse);
        return res.status(200).json({
            success: true,
            message: "Email Sent Successfully",
            emailResponse,
        })
    }
    catch(error){
        console.log(error);
        console.log(error.message);

        return res.status(500).json({
            success: false,
            message: "Something went wrong in contactUsController",
        });
    }
}