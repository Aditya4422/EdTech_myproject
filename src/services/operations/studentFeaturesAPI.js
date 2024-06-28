import {toast} from "react-hot-toast";
import rzpLogo from '../../assets/Logo/rzp_logo.png';
import { resetCart } from "../../slices/cartSlice";
import { setPaymentLoading } from "../../slices/courseSlice";
import { apiConnector } from "../apiconnector";
import { studentEndpoints } from "../apis";
require("dotenv").config();

const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src){
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        }

        script.onerror = () => {
            resolve(false);
        }

        document.body.appendChild(script);
    })
}

export async function BuyCourse(token, courses, user_details, navigate, dispatch){
    const toastId = toast.loading("Loading...");

    try{
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if(!res){
            toast.error("Razorpay SDK failed to load. Check your Internet connection");
            return;
        }

        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, {courses}, {
            Authorization: `Bearer ${token}`,
        });

        if(!orderResponse.data.success){
            throw new Error(orderResponse.data.message);
        }

        console.log("Order response .... ", orderResponse);

        const options = {
            key: process.env.RAZORPAY_KEY,
            currency: orderResponse.data.data.currency,
            amount: `${orderResponse.data.data.amount}`,
            order_id: orderResponse.data.data.id,
            name: "Study Notion",
            description: "Thankyou for purchasing the course",
            image: rzpLogo,
            prefill:{
                name: `${user_details.firstName} ${user_details.lastName}`,
                email: user_details.email,
            },
            handler: function (response){
                sendPaymentSuccessEmail(response, orderResponse.data.data.amount);
                verifyPayment({...response, courses}, token, navigate, dispatch)
            }
        }

        const paymentObject = new window.Razorpay(options);

        paymentObject.open();
        paymentObject.on("payment.failed", function(response){
            toast.error("Oops! Payment Failed");
            console.log(response.error);
        });
    }
    catch(error){
        console.log("Buycourse api error", error);
        toast.error("Couldnot make payment");
    }
    toast.dismiss(toastId);
}

async function verifyPayment(bodyData, token, navigate, dispatch){
    const toastId = toast.loading("Loading...");
}
