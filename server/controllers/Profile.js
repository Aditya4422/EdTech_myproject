const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.updateProfile = async(req, res) => {
    try{
        // fetch data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        
        // fetch user id from token
        const userId =req.user.id;

        // validate the data
        if(!contactNumber || !gender || !userId){
            return res.status(401).json({
                success: false, 
                message: 'All fields are required',
            });
        }
        // fetch the data from schemas
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update the data
        profileDetails.contactNumber = contactNumber;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        
        // save the data
        const details = await profileDetails.save();

        // return the response
        return res.status(200).json({
            success: true,
            message: 'Profile is updated successfully',
            data: details
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
    const userDetails = await User.findById(id);
    if(!userDetails){
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

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
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
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
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
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
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
      .populate("courses")
      .exec();

      
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
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