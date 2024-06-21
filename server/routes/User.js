const express = require('express');
const router = express.Router();

const {login, sendOTP, signUp, changePassword} = require('../controllers/Auth');

const {resetPassword, resetPasswordToken} = require('../controllers/ResetPassword');

const {auth} = require('../middlewares/auth');

// 1. Routes for login
router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOTP);
router.post('/changepassword', auth, changePassword);

// 2. Routes for resetting password
router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);

module.exports = router;

