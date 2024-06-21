// const { findByIdAndUpdate, validate } = require('../models/Course');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').config();

exports.createSubSection = async (req, res) => {
    try{
        // fectch the data
        const {sectionId, title, timeDuration, description} = req.body;
        const video = req.files.video;

        // validate the data
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(401).json({
                success: false, 
                message: 'All fields are required',
            });
        }
        // upload the video to cloud management servive like cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        console.log('upload details are ' ,uploadDetails);

        // create the entry of subsection 
        const newSubSection = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });
        // update the Section schema by adding the object id as reference
        const updatedSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: {
                    subSection: newSubSection._id,
                }
            },
            {new: true}
        ).populate("subSection").exec();
        // return the response
        return res.status(200).json({
            success: true,
            message: 'Subsection is created successfully',
            updatedSection,
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something wrong happened in creating the Subsection',
            errormessage: error.message,
        });
    }
}

exports.updateSubSection = async (req, res) => {
    try{

        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId);
    
        if (!subSection) {
            return res.status(404).json({
            success: false,
            message: "SubSection not found",
            })
        }
    
        if (title !== undefined) {
            subSection.title = title
        }
    
        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }
    
        await subSection.save()
        
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        console.log(updatedSection);
        // return the response
        return res.status(200).json({
            succes: true,
            message: 'Section and subsection are updated successfully',
            data: updatedSection,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something wrong happened while updating the section and subsection',
        });
    }
}

exports.deleteSubSection = async (req, res) => {
    try{
        // fetch the subsection id
        const {subSectionId, sectionId} = req.body;

        // validate the data
        if(!subSectionId){
            return res.status(400).json({
                succes: false,
                message: 'SubSection id is missing',
            });
        }

        if(!sectionId){
            return res.status(400).json({
                succes: false,
                message: 'Section id is missing',
            });
        }
        // remove the subsection id reference from the Section model
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $pull: {subSection : subSectionId}
            }
        )

        // delete the subsection by using findbyIdandDelete
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});
        if(!subSection){
            return res.status(404).json({
                success: false,
                message: 'Subsecion not found',
            })
        }

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        // return the response   
        return res.status(200).json({
            success: true,
            message: 'The subsection is deleted successfully',
            data: updatedSection,
        });     
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something wrong happened in deleting the subsection',
        });
    }
}