const Course = require('../models/Course');
const Section = require('../models/Section');
// const {uploadImageToCloudinary} = require('../utils/imageUploader');
const SubSection = require('../models/SubSection');

exports.createSection = async (req, res) => {
    try{
        // fetch the data
        const {sectionName, courseId} = req.body;

        // validate the data 
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        // create a course and make entry in db
        const newSection = await Section.create({sectionName});

        // update the Course schema by adding the newly created course object id
        const updatedCourse = await Course.findByIdAndUpdate(
                                        {_id: courseId},
                                        {
                                            $push:{
                                                courseContent: newSection._id,
                                            }
                                        },
                                        {new: true},
        ).populate({
            path: "courseContent",
            populate:{
                path: "subSection",
            },
        }).exec();
        
        // return the response
        return res.status(200).json({
            success: true,
            message: 'Section is created successfully',
            data: updatedCourse,
        });
    }
    catch(error){
        console.log(error);
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during section creation, please try again later!',
        });
    }
}


exports.updateSection = async (req, res) => {
    try{
        //fetch the data
        const {sectionName, sectionId, courseId} = req.body;

        //validate the data
        if(!sectionName || !sectionId || !courseId){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        //update the Section Schema
        const section = await Section.findByIdAndUpdate(
            {_id : sectionId},
            {sectionName: sectionName},
            {new: true},
        );

        const course = await Course.findById(courseId)
                                   .populate({
                                        path: "courseContent",
                                        populate:{
                                            path: "subSection",
                                        }
                                   }).exec();
        //return the response
        return res.status(200).json({
            success: true,
            message: section,
            data:course,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during section updation',
        });
    }
};

exports.deleteSection = async (req, res) => {
    try{
        // fetch Section Id  -- till now we are fetching data from body, this time lets assume the data come in the parameter form 
        const {sectionId, courseId} = req.body;
        // validate section id
        const isSection = await Section.findById(sectionId);
        const isCourse = await Course.findById(courseId);

        if(!isSection){
            return res.status(400).json({
                success: false,
                message: 'requested section is not found for being deleted',
            });
        }

        if(!isCourse){
            return res.status(400).json({
                success: false,
                message: 'requested course is not found for being updated',
            });
        }


        // use findByIdAndDelete to delte the data
        // delete the subsection id from course model which have the secionId array
        await Course.findByIdAndUpdate(courseId, { $pull:{courseContent:sectionId} } ); 

        await SubSection.deleteMany({_id: {$in: isSection.subSection}});
        await Section.findByIdAndDelete(sectionId);

        // find the updated course and return the updated course in response
        const course = await Course.findById(courseId)
                                          .populate({
                                            path: 'courseContent',
                                            populate:{
                                                path:"subSection",
                                            }
                                          }).exec();
        // return the response
        return res.status(200).json({
            success: true,
            message: 'The section is deleted successfully',
            data: course,
        }); 
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error in deleting the section, please try again later',
            wrong: error.message,
        })
    }
};