import toast from "react-hot-toast";
import {setToken, setLoading} from "../../slices/authSlice";
import {resetCart} from '../../slices/cartSlice';
import { setUser } from "../../slices/profileSlice";
import { apiConnector } from "../apiconnector";
import { endpoints } from "../apis";

const { SENDOTP_API, SIGNUP_API, LOGIN_API, RESETPASSTOKEN_API, RESETPASSWORD_API } = endpoints;

export function sendOtp (email, navigate){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            console.log("we are msking sendOtp request");
            const response = await apiConnector("POST", SENDOTP_API, {email, checkUserPresent: true});
            console.log("SendOTP api response........", response);
            console.log(response.data.success);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("OTP sent successfully");
            navigate("/verify-email");

        }
        catch(error){
            console.log("SendOtp api ERROR .........", error);
            toast.error("Could not send OTP");
            console.log(error.message);
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function signUp (accountType, firstName, lastName, email, password, confirmPassword, otp, navigate){
    return async (dispatch) => {
        const toastId = toast.loading("Loading.....");
        dispatch(setLoading(true));

        try{
            // api call to backend controller of signup
            const response = await apiConnector("POST", SIGNUP_API, {accountType, firstName, lastName, email, password, confirmPassword, otp});

            console.log("SignUp api response....", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }
            
            toast.success("Signup Successful");
            navigate("/login");
        }
        catch(error){
            console.log("SignUp Error.....", error);
            toast.error("SignUp Failed");
            navigate("/signup");
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function login(email, password, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading.....");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", LOGIN_API, {email, password});
            console.log('Login API response...', response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Login Successfull");
            dispatch(setToken(response.data.token));
            const userImage = response.data?.user?.image ? response.data.user.image : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
            dispatch(setUser({ ...response.data.user, image: userImage}));

            localStorage.setItem("token", JSON.stringify(response.data.token));
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard/my-profile");

        }
        catch(error){
            console.log("Login Api Error....", error);
            toast.error("Login Failed");
            navigate("/login");
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function getPasswordResetToken (email, setEmailSent) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", RESETPASSTOKEN_API, {email});
            console.log("Reset Password Token response ....", response);

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            toast.success("Reset Email sent");
            setEmailSent(true);

        }
        catch(error){
            console.log("Reset Password token error.....", error);
            toast.error("Failed to send reset email");
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function resetPassword (password, confirmPassword, token, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", RESETPASSWORD_API, {password, confirmPassword, token});
            console.log("Reset Password Token response ....", response);

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            toast.success("Password reset successfully");
            navigate("/login");
        }
        catch(error){
            console.log("RESETPASSWORD ERROR............", error)
            toast.error("Failed To Reset Password")
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function logout(navigate){
    return (dispatch) => {
        dispatch(setToken(null));
        dispatch(setUser(null));
        dispatch(resetCart());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out");
        navigate("/");
    }
}
