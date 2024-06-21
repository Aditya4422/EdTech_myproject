import {toast} from 'react-hot-toast';
import {setUser} from '../../slices/profileSlice';
import {apiConnector} from '../apiconnector';
import {settingsEndpoints} from '../apis';
import {logout} from './authAPI';

const { UPDATE_DISPLAY_PICTURE_API, UPDATE_PROFILE_API, CHANGE_PASSWORD_API, DELETE_PROFILE_API} = settingsEndpoints;

export function updateDisplayPicture (token, formData) {
    return async (dispatch) =>{
        const toastId = toast.loading("Loading...");
        try{
            const response = await apiConnector("PUT",UPDATE_DISPLAY_PICTURE_API, formData,{
                "Content-Type": 'multipart/form-data',
                Authorization: `Bearer ${token}`
            });

            console.log("Update display picture api response ...", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("display picture updated successfully");
            dispatch(setUser(response.data.data));
        }
        catch(error){
            console.log("Display Picture API error", error);
            toast.error(error.message);
        }
        toast.dismiss(toastId);
    }
}

export function updateProfile(token, formData){
    return async (dispatch) =>{
        const toastId = toast.loading("Loading...");
        try{
            const response = await apiConnector("PUT",UPDATE_PROFILE_API, formData,{
                Authorization: `Bearer ${token}`
            });

            console.log("Update profile api response ...", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            const userImage = response.data.updatedUserDetails.image
                              ? response.data.updatedUserDetails.image
                              : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.updatedUserDetails.firstName} ${response.data.updatedUserDetails.lastName}`;

            dispatch(setUser({...response.data.updatedUserDetails, image: userImage}));

            toast.success("Profile updated successfully");
        }
        catch(error){
            console.log("Update profile api error...", error);
            toast.error(error.message);
        }
        toast.dismiss(toastId);
    }
}

export async function changePassword (token, formData){
    const toastId = toast.loading("Loading...");
    try{
        const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
            Authorization: `Bearer ${token}`,
        });

        console.log("change password api response ....", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Password canged successfully");
    }
    catch(error){
        console.log("Change Password api error...", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
}


export function deleteProfile(token, navigate){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");

        try{
            const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
                Authorization: `Bearer ${token}`,
            });

            console.log("Delete profile api response", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Profile Deleted successfully");
            dispatch(logout(navigate));

        }
        catch(error){
            console.log("Delete profile api error...", error);
            toast.error(error.message);
        }

        toast.dismiss(toastId);
    }
}

