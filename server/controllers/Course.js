const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').config();
const CourseProgress = require('../models/CourseProgress');
const {convertSecondsToDurations} = require('../utils/secToDuration')
const Section = require('../models/Section')
const SubSection = require('../models/SubSection')

// In course creation we need to store our image to cloudinary cloud service and store the secure url in the db for reference
// In this creating we have to store insturctor id and Category id  as a reference in course schema
// whereas we have to store the course id in User schema as well as in Category schema

// 1. create course handler function
// 2. edit the course details 
// 3. show all course handler function
// 4. get all course delatils of a particular course
// 5. get Instructor courses for a specific instructor

exports.createCourse = async (req, res) => {
    try{
        // fetch data

        let {courseName, courseDescription, whatYouWillLearn, price, tag: _tag, category, status, instructions: _instructions} = req.body;

        // get thumbnail
        const thumbnail =  req.files.thumbnailImage;     // we are extracting thumbnail from files because user has send it in the req files

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price  || !tag.length || !category || !thumbnail || !instructions.length){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        if (!status || status === undefined) {
			status = "Draft";
		};

        // get instructor details
        const userId  = req.user.id;   // becuase we have stored the userid in the payload and after logging in we store it in as req user
        const insturctorDetails = await User.findById(userId, {accountType: "Instructor"});
        console.log("Instuctor Details: ", insturctorDetails);

        if(!insturctorDetails){
            return res.status(404).json({
                success: false,
                message: 'Instructor not found',
            });
        }
        // validate the Categorys
        const CategoryDetails = await Category.findById(category);
        if(!CategoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // upload thumbnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create course
        const newCourse = await Course.create({
            courseName: courseName,
            courseDescription: courseDescription,
            instructor: insturctorDetails._id,
            whatWillYouLearn: whatYouWillLearn,
            price: price,
            tag: tag,
            category: CategoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions,
        });
        // update user schema by pushing the new couse id  in the courses array
        await User.findByIdAndUpdate(
            {_id : insturctorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        );
        // update Category schema by pushing the new couse id  in the courses array
        await Category.findByIdAndUpdate(
            {_id: CategoryDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new: true},
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Course is created successfully",
            newCourse,
        }); 

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something wrong happened in during creation of course',
            errormessage: error.message,
        });
    }
}

exports.editCourse = async(req, res) => {
    try{
        const {courseId} = req.body;
        const updates = req.body;
        const course = await Course.findById(courseId);

        if(!course){ 
            return res.status(404).json({
                success: false,
                message: "Course not found",
            })
        }

        if(req.files){ // if thumbnail is also sent by user to be upadated
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
            course.thumbnail = thumbnailImage.secure_url;
        }

        // update those fields only which are present in the request body
        for(const key  in  updates){
            if(updates.hasOwnProperty(key)) {   // hasownproperty will say that the object you have has the specific key value or not
                if(key === "tag" || key==="instructions"){
                    course[key] = JSON.parse(updates[key]);
                }
                else course[key] = updates[key];
            }
        }

        // lets update the DB with new values
        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        }).populate({
            path: "instructor",
            populate:{
                path: "additionalDetails",
            }
        }).populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        }).exec();

        return res.status(200).josn({
            success: true,
            message: "Courese Updated successfully",
            data: updatedCourse,
        })

    }
    catch(error){
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getAllCourses = async (req, res) => {
    try{
        const allCourses = await Course.find(
            {status: "Published"},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,

            }).populate("instuctor").exec();

            return res.status(200).json({
                success: true,
                message: "Course data is fetched successfully",
                data: allCourses,
            });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something wrong happend in getting all the courses',
        });
    }   
}

exports.getCourseDetails = async (req, res) => {
    try{
        // fetch the coursre id 
        const {courseId} = req.body;
        // find the details on the basis of courseId  and populate all the object id present in the coursre details
        const courseDetails = await Course.find({_id: courseId}).populate(
                                                                            {
                                                                                path: 'instructor',
                                                                                populate: {
                                                                                    path: 'additionalDetails',
                                                                                },
                                                                            }
                                                                        )
                                                                        .populate('category')
                                                                        .populate('ratingAndReviews')
                                                                        .populate(
                                                                            {
                                                                                path:'courseContent',
                                                                                populate:{
                                                                                    path:'subSection',
                                                                                }
                                                                            }
                                                                        ).exec();
        // validate the data
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Coursre details not found for provided course id ${courseId}`,
                errormessage: error.message,
            });
        }

        // calculte the time duration of the the course
        let totalDuration = 0;
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const duration = parseInt(subSection.timeDuration);
                totalDuration += duration;
            })
        })

        totalDuration = convertSecondsToDurations(totalDuration);

        // return the response
        return res.status(200).json({
            success: true,
            message: 'Course details are fetched successfully',
            data: {
                courseDetails,
                totalDuration,
            }
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Something happened while fetching all the course details',
            errormessage: error.message,
        });
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try{
        const {courseId} = req.body;
        const userId = req.user.id;
        const courseDetails = await Course.findOne({_id: courseId})
                                          .populate({
                                            path: "instructor",
                                            populate: {
                                                path: "additionalDetails"
                                            }
                                          })
                                          .populate("category")
                                          .populate("ratingAndReviews")
                                          .populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection",
                                            }
                                          })
                                          .exec();
        
        let courseProgressCount = await CourseProgress.findOne({courseId: courseId, userId: userId});
        console.log("Course progress count is : ",courseProgressCount);
        
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: "Course not found",
            })
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration)
            totalDurationInSeconds += timeDurationInSeconds
        })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                ? courseProgressCount?.completedVideos
                : [],
            },
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getInstructorCourses = async (req, res) => {
    try{
        const instructorId = req.user.id;

        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            data: instructorCourses,       
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch instructor courses",
            error:  error.message,
        });
    }
}

exports.deleteCourse = async (req, res) => {
    try{
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message: "course not found",
            });
        }

        // unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled;
        
        for(const studentId in studentsEnrolled){
            await User.findByIdAndUpdate(studentId, {$pull: {courses: courseId}});
        }

        // delete sections and subsections of that particular course
        const courseSections = course.courseContent;

        for(const sectionId in courseSections){  // this loop for section 
            const section = await Section.findById(sectionId);
            if(section){
                const subSections = section.subSection;
                for(const subSectionId in subSections){  // this loop for deleting the subsection of the section
                    await SubSection.findByIdAndDelete(subSectionId);
                }
            }
            await Section.findByIdAndDelete(sectionId);
        }

        // now delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "course deleted successfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server error",
            error: error.message,
        })
    }
}