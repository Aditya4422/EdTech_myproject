const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// create reting and review
exports.createRating = async (req, res) => {
    try{
        // get userId
        const userId = req.user.id;
        
        // fetch the course id , rating and review
        const {courseId, rating, review} = req.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({_id: courseId, studentsEnrolled: {$elemMatch: {$eq: userId}}});
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: 'User not enrolled in the course',
            });
        }

        // check if the user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({user:userId, course: courseId});
        if(alreadyReviewed){
            return res.status(403).json({
                success: false, 
                message: 'Course is already reviewed by the user',
            });
        }
        // create rating and review
        const ratingReview = await RatingAndReview.create({
                                                        rating, review,
                                                        course: courseId,
                                                        user: userId, });
        // update course with this rating and review
        const updatedCourse = await Course.findByIdAndUpdate(
                                        {_id: courseId},
                                        {
                                            $push:{
                                                ratingAndReviews: ratingReview._id,
                                            }
                                        },
                                        {new: true});
        // return response
        return res.status(200).json({
            success: true,
            message: 'Rating and Review created successfully',
            data: {
                ratingReview,
                updatedCourse,
            }
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server error while givin rating and reviews',
        });
    }
};

// get average rating
exports.getAverageRating = async(req, res) => {
    try{
        const courseId = req.body.courseId;

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ]);

        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }
        else{
            return res.status(200).json({
                success: true,
                message: 'Average Rating is 0, no ratings given till now',
                averageRating:0,
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while calculating the average rating',
        });
    }
}

// get all rating and reviews
exports.getAllRating = async (req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                                        .sort({rating: 'desc'})
                                                        .populate({
                                                            path: "user",
                                                            select: "firstName lastName email image", // select the fields only which we want to populate
                                                        })
                                                        .populate({
                                                            path: "course",
                                                            select: "courseName",
                                                        })
                                                        .exec();
        
        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: allReviews,
        });
                                                
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server error while fetching all the rating and reviews',
        });
    }
};