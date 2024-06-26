const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
const CourseProgress = require('../models/CourseProgress');
const mongoose = require('mongoose');
const crypto = require("crypto");

// On backend we have to just create and initiate the Razorpay order on our side, further things will be done
// by the razorpay and the response will be sent to us and we have to verify that only

//capture the payment and intitate the Razorpay order
exports.capturePayment = async (req, res) => {
    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.status(400).json({
            success: false,
            message: "We didn't find the courses in courses array",
        });
    }

    let totalAmount = 0;

    for(const course_id of courses){   // calculating the total amount of all the courses in cart
        let course;

        try{
            course = await Course.findById(course_id);

            if(!course){
                return res.status(400).json({
                    success: false,
                    message: "could not find the course",
                });
            }

            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(404).json({
                    success: false,
                    message: "Student is already enrolled in the course",
                });
            }

            totalAmount += course.price;
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    const options = {
        amount: totalAmount*100,
        currency: "INR",
        reciept: Math.random(Date.now()).toString(),
    }

    // initiate the payment by creating the order 
    try{
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success: true,
            data: paymentResponse,
            message:"Payment done successfully",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Couldnot initiate the order."
        });
    }
}


// verify the payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;

    const userId = req.user.id;

    if( !razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){
        return res.status(400).json({
            success: false,
            message: "something is missing in verifying the payment controller",
        });
    }   

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                                    .update(body.toString())
                                    .digest("hex");

    if(expectedSignature === razorpay_signature){
        await enrollStudents(courses, userId, res);

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        })
    }
}

// send the success email to the student of successful payment
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({
            success: false,
            message: "Please provide all the details",
        });
    }

    try{
        const enrolledStudent = await User.findById(userId);

        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName} ${enrolledStudent.lastName}`, amount/100, orderId, paymentId),
        );
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Couldnot send payment success email",
        })
    }
}

const enrollStudents = async (courses, userId, res) => {
    if(!courses || !userId){
        return res.status(404).json({
            success: false,
            message: "Courses or userId is missing in enrollstudent controller of payment.js"
        });
    }

    for(const courseId of courses){
        try{
            const enrolledCourse = await Course.findOneAndUpdate({_id:courseId}, {$push: {studentsEnrolled: userId}}, {new: true});

            if(!enrolledCourse){
                return res.status(404).json({
                    success: false,
                    message: "Course not found",
                });
            }

            console.log("Updated course: ", enrolledCourse);

            const courseProgress = await CourseProgress.create({
                courseId: courseId,
                userId: userId,
                completedVideos: [], 
            });

            const enrolledStudent = await User.findByIdAndUpdate(userId, {$push:{courses: courseId, courseProgress: courseProgress._id}}, {new: true});

            const emailResponse = await mailSender(
                enrolledStudent.email,
                `You are successfully enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName} ${enrolledStudent.lastName}`)
            );

            console.log("Email response of successfull enrollment :", emailResponse);
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error in enroll student in payment.js",
            })
        }
    }
}