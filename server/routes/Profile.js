const express = require('express');
const router = express.Router();

const {auth} = require('../middlewares/auth');

const {deleteProfile, updateDisplayPicture, updateProfile, getAllUserDetails, getEnrolledCourses} = require('../controllers/Profile');

// Profile Routes
router.delete('/deleteProfile', deleteProfile);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getAllUserDetails);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);

module.exports = router;
