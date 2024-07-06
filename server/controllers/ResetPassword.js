const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try{
        // get email from req body
        const email = req.body.email;

        // check user for this email, email validation
        const user = await User.findOne({email: email});
        if(!user){
            return res.json({
                success: false,
                message: 'Your Email is not registered with us',
            });
        }

        // generate token
        const token = crypto.randomUUID();  // Crypto is a inbuilt package to generate random bytes which can be used as token

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email: email}, 
                                                            {
                                                                token: token,
                                                                resetPasswordExpires: Date.now() + 5*60*1000,
                                                            },
                                                            {new: true});
        
        console.log("Details : ", updatedDetails);
        // create url
        const url = `http://localhost:3000/update-password/${token}`;
        // send email containing the url
        await mailSender(email, 
                        "Password Reset Link",
                        `Password Reset Link: ${url}. Please click this url to reset the password`);
        // return response
        return res.json({
            success: true, 
            message: 'Email sent successfully, please check email and change password',
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false, 
            message: 'Internal server error in reset token generation',
            errormessage: error.message,
        });
    }
}

// reset Password
exports.resetPassword = async (req, res) => {
    try{
        // fetch the data
        const {password, confirmPassword, token} = req.body;      //Since, we have send the token in the url form, then how it come into request body 
                                                                  //-> answer is the token and details are send in the request body using the frontend
        // validate the data
        if(password !== confirmPassword){
            return res.status(401).json({
                success: false,
                message: 'Passwords are not matching',
            });
        }

        // get user details from db using the token
        const userDetails = await User.findOne({token: token});
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: 'The token is invalid',
            });
        }

        // check the validity of token
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(401).json({
                success: false,
                message: 'The token is old and invalid, please generate a new token',
            });
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update the password in db
        await User.findOneAndUpdate({token: token},
                                    {password: hashedPassword},
                                    {new: true});
        // return the response
        return res.status(200).json({
            success: true,
            message: 'Password is updated',
        });

    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            message: 'Internal server error during resetting password, please try again later!',
            errormessage: error.message,
        });
    }
}