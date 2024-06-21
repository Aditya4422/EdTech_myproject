const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const cookie = require('cookie-parser');
require('dotenv').config();
// it has following functions
// 1. sendOTP function
// 2. signup function
// 3. login function

exports.sendOTP = async (req, res) => {
    try{
        //extract the email from request body
        const {email} = req.body;
        
        // check if the user exist already or not
        const checkUserPresent = await User.findOne({email});

        //if user already exist then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: 'User already registered'
            })
        }

        // now we will generate otp for verification
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        
        // let us check whether the unique otp is generated or not 
        let result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email, otp};  // create an otpPayload object to pass to DB for entry

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            success: true,
            message: "OTP Sent successfully",
            otp,
        })
    }
    catch(error){
        console.log("Something wrong happened in sending otp", error.message);
        return res.status(500).json({
            success: false, 
            error: error.message,
        });
    }

}

exports.signUp = async (req, res) => {
    try{
        //fetch data
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        // validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp){
            return res.status(403).json({
                success: false,
                message: 'All the fields required',
            });
        }

        // match two passwords
        if(password!==confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Both password doesn't matches",
            });
        }

        // user already exists or not
        let checkUserRegistered = await User.findOne({email: email});
        if(checkUserRegistered){
            return res.status(400).json({
                success: false,
                message: 'User is already resgistered',
            });
        }

        // fetch recent otp
        let recentOtp = await OTP.find({email}).sort({created:-1}).limit(1);
        console.log('This is the recent otp : ', recentOtp);

        // validate the otp
        if(recentOtp.length === 0){
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            });
        }
        else if(recentOtp[0].otp != otp){
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // now hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user
        let approved = "";
        approved === 'Instructor' ? (approved=false) : (approved=true);

        // create an entry in DB
        // since we have a additional detail in the userschema which refers to the pofile, so we first create a profile in DB by DB call and
        // then fetch the objectID of profile and give it to the userSchema
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            user,
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User is not registered, Please try again later!',
        });
    }
    
}

exports.login = async (req, res) => {
    try{
        // fetch data from request body
        const {email, password} = req.body;

        // validate the data
        if(!email || !password){
            return res.status(403).json({
            success: false,
            message: 'All fields are required', 
            });
        }
        // user check if exist or not
        let user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User is not registered',
            });
        }

        // generate jwt after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {           // this payload has been created and given to the jwttoken generator 
                email: user.email, // to generate the unique token for all users because the payload is itself unique for all the user
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            // create and set the cookie and send it as a response
            const options = {
                expires: new Date(Date.now() + 24*60*60*1000),
                httpOnly: true,
            }

            res.cookie('token', token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged in successfully',
            });
        }
        else{
            return res.status(401).json({
                success: false,
                message: 'Password is not correct',
            });
        }
    }
    catch(error){
        return res.status(400).json({
            success: false,
            message: 'Something wrong happened during logging in, Please try again',
        });
    }
}

// exports.changePassword = async (res, res) => {
//     // fetch data (oldPassword, newPassword, confirmNewPassword)
//     const {email, oldPassword, newPassword, confirmNewPassword} = req.body;
//     // validate the data
//     if(!oldPassword || !newPassword || !confirmNewPassword){
//         return res.status(400).json({
//             success: false,
//             message: 'All fields are required',
//         });
//     }

//     const user = await User.findOne({email});
//     if(await bcrypt.compare(oldPassword, user.password)){
//         user.updateOne
//     }
//     else{
//         return res.status(401).json({
//             success: false,
//             message: 'Old Password is not correct, please try again!',
//         });
//     }
    
//     // update the password in the database
//     // send mail
//     // return response
// }


exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200)
			      .json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};