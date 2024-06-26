const express = require('express');
const router = express.Router();

const {auth, isInstructor} = require('../middlewares/auth');

const {deleteProfile, updateProfile, updateDisplayPicture, getAllUserDetails, getEnrolledCourses, instructorDashboard} = require('../controllers/Profile');

// Profile Routes
router.delete('/deleteProfile',auth, deleteProfile);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getAllUserDetails);
router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, updateDisplayPicture);
router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);

module.exports = router;
