const jwt = require('jsonwebtoken');
require("dotenv").config();
// const User = require('../models/User');

// auth
exports.auth = async (req, res, next) => {      // next is used to go on next middleware and the order of middleware is defined in the route
    try{
        // TO do the authentication
        // 1.Extract token  2.If token is missing, return response  3.Do the verification of JWT token

        // extract the token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        //if token missing, then return response
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        // verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success: false,
                message: 'Token is not verified',
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            message: 'Internal server error with auth middleware',
        });
    }
    
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for students only',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User cannot be verified, please try again',
        });
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for instructor',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User cannot be verified, please try again',
        });
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin',
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'User cannot be verified',
        });
    }
}