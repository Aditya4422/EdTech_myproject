const { default: mongoose } = require('mongoose');
const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const Course = require('../models/Course');
const {convertSecondsToDurations} = require("../utils/secToDuration");
const CourseProgress = require('../models/CourseProgress');

exports.updateProfile = async(req, res) => {
    try{
        // fetch data
        const {firstName="", lastName="", dateOfBirth="", about="", contactNumber="", gender=""} = req.body;
        
        // fetch user id from token
        const userId =req.user.id;

        // fetch the userdetails and update the first and last name
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update the data
        const user = await User.findById(userId, {
          firstName,
          lastName
        });
        await user.save();

        profileDetails.contactNumber = contactNumber;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        
        // save the data
        await profileDetails.save();

        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec();

        // return the response
        return res.status(200).json({
            success: true,
            message: 'Profile is updated successfully',
            updatedUserDetails,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something wrong happened in updating profile',
        });
    }
};


// hwo can we shedule the task
exports.deleteProfile = async (req, res) => {
  try{

    const id = req.user.id;
    console.log("THis user id is sent for deleting ", id);
    const userDetails = await User.findById({_id: id});
    if(!userDetails){
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // deleting the profile
    await Profile.findByIdAndDelete({_id: new mongoose.Types.ObjectId(userDetails.additionalDetails)});

    // removing the userId from the courses in which he was enrolled already
    for(const courseId of userDetails.courses){
      await Course.findByIdAndUpdate(courseId, {$pull: {studentsEnrolled: id}}, {new: true});
    }
    
    // now we can delete the user
    await User.findByIdAndDelete({_id: id});

    return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
  } 
  catch(error){
    console.log(error);
    return res.status(500).json({
        success: false,
        message: 'something wrong happened while delting the user',
    });
  } 
};

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
    console.log("THis user id is sent for getting user data ", id);
		const userDetails = await User.findById({_id : id})
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);

		return res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture;
      const userId = req.user.id;
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      );

      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      
      return res.status(200).json({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id;
      let userDetails = await User.findOne({
        _id: userId,
      })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          }
        }
      })
      .exec();

      userDetails = userDetails.toObject();

      var SubsectionLength = 0;

      for(var i=0; i<userDetails.courses.length; i++){
          let totalDurationInSeconds = 0;
          SubsectionLength = 0;

          for(var j=0; j<userDetails.courses[i].courseContent.length; j++){
            totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0);
            
            userDetails.courses[i].totalDuration = convertSecondsToDurations(totalDurationInSeconds);

            SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length;
          }

          let courseProgressCount = await CourseProgress.findOne({
            courseId: userDetails.courses[i]._id,
            userId: userId,
          });

          courseProgressCount = courseProgressCount?.completedVideos.length;

          if(SubsectionLength === 0){
            userDetails.courses[i].progressPercentage = 100;
          }
          else{
            const multiplier = Math.pow(10, 2);
            userDetails.courses[i].progressPercentage = Math.round((courseProgressCount/SubsectionLength) * 100 * multiplier) / multiplier; 
          }
      }
      
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};


exports.instructorDashboard = async (req, res) => {
    try{
      const courseDetails = await Course.find({instructor: req.user.id});

      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length;
        const totalAmountGenerated = totalStudentsEnrolled * course.price;

        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          totalStudentsEnrolled,
          totalAmountGenerated,
        };

        return courseDataWithStats;
      });

      return res.status(200).json({
        success: true,
        courses: courseData,
      })
    }
    catch(error){
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error in instructor Dashboard"
      });
    }
}