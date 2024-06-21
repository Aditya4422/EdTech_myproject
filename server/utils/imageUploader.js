const cloudinary = require('cloudinary').v2;

// we have the cloudinary package to maintain our media assets on cloud

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {    // these parameters can be passed to the function
    try{
        const options = {folder};                                                    // height and quality is used to compress the file and store

        if(height){
            options.height = height;
        }

        if(quality){
            options.quality = quality;
        }
        options.resource_type = 'auto';

        return await cloudinary.uploader.upload(file.tempFilePath, options);
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Something wrong happened in uploading the file, please try again later',
        });
    }
}