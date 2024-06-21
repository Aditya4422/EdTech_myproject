const express = require('express');
const router = express.Router();

//import controllers and and auth middlewares
const {createCourse, getAllCourses, getCourseDetails, getFullCourseDetails, editCourse, getInstructorCourses, deleteCourse} = require('../controllers/Course');

const {createCategory, showAllCategories, categoryPageDetails} = require('../controllers/Category');

const {createSection, updateSection, deleteSection} = require('../controllers/Section');

const {createSubSection, updateSubSection, deleteSubSection} = require('../controllers/SubSection');

const {createRating, getAllRating, getAverageRating} = require('../controllers/RatingAndReview');

const {auth, isAdmin, isInstructor, isStudent} = require('../middlewares/auth');
// const { create } = require('../models/Category');

// -----------------------------------ROUTES-----------------------------------------------------------------------------------
// 1. Course Routes
router.post('/createCourse', auth, isInstructor, createCourse);  // only created by course instructor
router.post('/addSection', auth, isInstructor, createSection); // add section to a course
router.post('/updateSection', auth, isInstructor, updateSection); // update a section
router.post('/deleteSection', auth, isInstructor, deleteSection); // delete a section
router.post('/addSubSection', auth, isInstructor, createSubSection); // add subsection
router.post('/updateSubSection', auth, isInstructor, updateSubSection); // update subsection
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection); // delete subsection
router.get('/getAllCourses', getAllCourses);
router.post('/getCourseDetails', getCourseDetails);
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
router.post('/editCourse', auth, isInstructor, editCourse);
router.get('/getInstructorCourses', auth, isInstructor, getInstructorCourses);
router.delete('/deleteCourse', deleteCourse);


// 2. Category routes (for admins)
router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/showAllCategories', showAllCategories);
router.get('/categoryPageDetails', categoryPageDetails);

// 3. Rating and Reviews
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRating);

module.exports = router;

