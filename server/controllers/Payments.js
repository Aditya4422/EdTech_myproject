const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');

// On backend we have to just create and initiate the Razorpay order on our side, further things will be done
// by the razorpay and the response will be sent to us and we have to verify that only

//capture the payment and intitate the Razorpay order
exports.capturePayment = async (req, res) => {
    try{
        // fetch courseId and userId
        const {course_id} = req.body;
        const userId = req.user.id;
        // validation
        if(!course_id || !userId){
            return res.status(400).json({
                success: false,
                message: 'something is missing between course id and user id',
            });
        }
        
        // valid courseDetail
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.status(401).json({
                    success: false,
                    message: 'Could not find the course',
                });
            }

            // user already pay for the same course
             const uid = new mongoose.Types.ObjectId(userId);
             if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: 'Student is already enrolled',
                });
             }
        }
        catch(error){
            return res.status(500).json({
                success: false,
                message: error.message, 
            });
        }

        // create order
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            reciept: Math.random(Date.now()).toString(),
            notes: {
                courseId : course_id,
                userId,
            }
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            // return response
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Something wrong happened in the initiating the order'
            });
        }
        
        
    }
    catch(error){
        return res.status(401).json({
            success: false,
            message: 'Somehting wrong happened in payment, please try again later',
        });
    }
};


// verify the signature and authorize the payment 
// -> in this process, firstly the razropay will hit our verify signature api route and its request body will contain the hashed form of shared secret key 
// between our sever and razorpay server, we have to convert our stored secret key into hashed from using HMAC algorithm. 
// We can send the addtional user details in form of notes and will carve out from the req body

exports.verifySignature = async (req, res) => {
    try{
        const webhookSecret = "12345678";
        const signature = req.headers['x-razorpay-signature'];

        const shasum = crypto.createHmac("sha256", webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if(signature === digest){
            console.log("Payment is authorized");

            const {courseId, userId} = req.body.payload.payment.entity.notes;

            try{
                // find the course and enroll the student in it
                const enrolledCourse = await Course.findByIdAndUpdate(
                                                                        {_id: courseId},
                                                                        {$push : {studentsEnrolled: userId}},
                                                                        {new: true},
                                                                    );
                if(!enrolledCourse){
                    return res.status(401).json({
                        success: false,
                        message: 'Course not found for updating',
                    });
                }

                console.log(enrolledCourse);

                const enrolledStudent = await User.findByIdAndUpdate(
                                                                        {_id: userId},
                                                                        {$push: {courses: courseId}},
                                                                        {new: true},
                );


                // now send confirmation email to the user
                const emailResponse = await mailSender(
                                                        enrolledStudent.email,
                                                        "Congratulations from us",
                                                        courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName),

                );
                console.log(emailResponse);
                return res.status(200).json({
                    success: true,
                    message: 'Course is enrolled successfully and message is sent to the user',
                });
            }
            catch{
                console.log(error);
                return res.status(400).json({
                    success: false,
                    message: 'Something wrong happened while updating course and user schema',
                });
            }

        }
        else{
            return res.status(500).json({
                success: false,
                message: 'Signature and message digest doesnot match',
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(401).json({
            success: false,
            message: 'Something wrong happened while verifying and authorizing the payment',
        });
    }
};