import { toast } from 'react-hot-toast';
import { updateCompletedLectures } from '../../slices/viewCourseSlice';

import { apiConnector } from '../apiconnector';
import { courseEndpoints } from '../apis';

const { COURSE_DETAILS_API,
        COURSE_CATEGORIES_API,
        GET_ALL_COURSE_API,
        CREATE_COURSE_API,
        EDIT_COURSE_API,
        CREATE_SECTION_API,
        CREATE_SUBSECTION_API,
        UPDATE_SECTION_API,
        UPDATE_SUBSECTION_API,
        DELETE_COURSE_API,
        DELETE_SECTION_API,
        DELETE_SUBSECTION_API,
        GET_ALL_INSTRUCTOR_COURSES_API,
        GET_FULL_COURSE_DETAILS_AUTHENTICATED,
        CREATE_RATING_API,
        LECTURE_COMPLETION_API,
 } = courseEndpoints;

export const getAllCourses = async () => {
    const toastId = toast.loading("Loading...");
    let result = [];

    try{
        const response = await apiConnector("GET", GET_ALL_COURSE_API);
        if(!response?.data?.success){
            throw new Error("Could not Fetch course Categories");
        }
        result = response?.data?.data;
    }
    catch(error){
        console.log("GET_ALL_COURSES_API API ERROR.......", error);
        toast.error(error.message);
    }

    toast.dismiss(toastId);
    return result;
}

export const fetchCourseDetails = async (courseId) => {
    const toastId = toast.loading("Loading...");
    let result = null;

    try{
        const response = await apiConnector("POST", COURSE_DETAILS_API, {courseId});
        
        if(!response.data.success){
            throw new Error(response.data.message);
        }
        result = response.data;
    }
    catch(error){
        console.log("COURSE_DETAILS_API ERROR....", error);
        result = result.response;
    }

    toast.dismiss(toastId);
    return result;
}

export const fetchCourseCategories = async () => {
    let result = []
    const toastId  = toast.loading("Loading ...");
    try{
        const response = await apiConnector("GET", COURSE_CATEGORIES_API);

        // console.log("Course category response...", response);
        if(!response?.data?.success){
            throw new Error("could not fetch course categories");
        }

        result = response?.data?.data;
    }
    catch(error){
        console.log('COURSE_CATEGORY_API ERROR ....');
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result
}

// adding the course details
export const addCourseDetails = async (data, token) => {
    let result = null;
    const toastId = toast.loading("Loading....");

    try{
        console.log("Form Data before making call to Create course Api .", data);
        const response = await apiConnector("POST", CREATE_COURSE_API, data, {
            "Content-Type" : "multipart/form-data",
            Authorization: `Bearer ${token}`,
        });

        // console.log('CRreate course api response ...', response);

        if(!response?.data?.data){
            throw new Error("Could not add course details");
        }

        toast.success("Course Details added successfully");
        result = response?.data?.data;
    }
    catch(error){
        console.log("create course api error", error.message);
    }

    toast.dismiss(toastId);
    return result;
}

// edit the course details
export const editCourseDetails = async(data, token) => {
    let result = null;
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("POST", EDIT_COURSE_API, data, {
            "Content-Type" : "multipart/form-data",
            Authorization: `Bearer ${token}`,
        })

        // console.log("EDIT_COURSE_API...", response);

        if(!response?.data?.data){
            throw new Error("could not edit the course details");
        }

        toast.success("course details edited successfully");
        result = response?.data?.data;
    }
    catch(error){
        console.log("Edit course api error....", error);
        toast.error(error.message);
    }

    toast.dismiss(toastId);
    return result;
}


// create section
export const createSection = async (data, token) => {
    let result =  null;
    const toastId = toast.loading("Loading...");

    // console.log("data we got for making call to create section api...", data);

    try{
        const response = await apiConnector("POST", CREATE_SECTION_API, data, {
            Authorization: `Bearer ${token}`,
        })

        // console.log("create section api response...", response);

        if(!response?.data?.success){
            throw new Error("could not create secion ...");
        }
        toast.success("Course Section created succesfully");
        result = response?.data?.data;
        // console.log("data recieved from create section api ", result);
    }
    catch(error){
        console.log("create section api error", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result; 
}

// create a subsection
export const createSubSection = async( data, token) => {
    let result = null;
    const toastId = toast.loading("Loading");

    try{

        const response = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        // console.log("create Subsection response...", response);

        if(!response?.data?.success){
            throw new Error("could not create subsection ...");
        }
        toast.success("Lecture added successfully");
        result = response?.data?.data;
    }
    catch(error){
        console.log("create Subsection api error", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result; 
}


// update subsection
export const updateSection = async (data, token) => {
    let result = null;
    const toastId = toast.loading("Loading");

    try{

        const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        console.log("update Section response...", response);

        if(!response?.data?.success){
            throw new Error("could not update Section ...");
        }
        toast.success("Section updated successfully");
        result = response?.data?.data;
    }
    catch(error){
        console.log("update section api error", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result; 
}

// UPDATE A SUB-SECTION
export const updateSubSection = async (data, token) => {
    let result = null;
    const toastId = toast.loading("Loading");

    try{

        const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        // console.log("update subSection response...", response);

        if(!response?.data?.success){
            throw new Error("could not update SubSection or Lecture ...");
        }
        toast.success("SubSection or Lecture updated successfully");
        result = response?.data?.data;
        // console.log("value of result from response?.data?.data ...", result);
    }
    catch(error){
        console.log("update Sub-section api error", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result; 
}

// delete a section 
export const deleteSection = async (data, token) => {
    let result = null;
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("POST", DELETE_SECTION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        console.log("Delete section api response...", response);

        if(!response?.data?.success){
            throw new Error("could not delete the section");
        }

        toast.success("Course section is Deleted successfully");
        result = response?.data?.data;
    }
    catch(error){
        console.log("Delete section api error", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result;
}

export const deleteSubSection = async (data, token) => {
    let result = null;
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        // console.log("Delete Sub-section api response...", response);

        if(!response?.data?.success){
            throw new Error("could not delete the Sub-section");
        }

        toast.success("Course Sub-section is Deleted successfully");
        toast.dismiss(toastId);
        result = response?.data?.data;
    }
    catch(error){
        console.log("Delete Sub-section api error", error);
        toast.error(error.message);
        toast.dismiss(toastId);
    }
    
    return result;
}

// fetching all the courses under the specific instructor
export const fetchInstructorCourses = async (token) => {
    let result = [];
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("GET", GET_ALL_INSTRUCTOR_COURSES_API, null, {
            Authorization: `Bearer ${token}`,
        });

        // console.log("Instructor courses Api response ....", response);

        if(!response?.data?.data){
            throw new Error("Could not fetch instructor courses....");
        }

        result = response?.data?.data;
    }
    catch(error){
        console.log("Instructor courses api error............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

// delete a course 
export const deleteCourse = async(data, token) => {
    const toastId = toast.loading("Loading...");
    try{
        const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
            Authorization: `Bearer ${token}`,
        });

        // console.log("Delete course api response....", response);

        if(!response?.data?.success){
            throw new Error("couldnot delete course..");
        }

        toast.success("Course is deleted successfully");
    }
    catch(error){
        console.log("Delete course api error....", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
}

// get full details of course
export const getFullDetailsOfCourse = async (courseId, token) => {
    const toastId = toast.loading("Loading...");
    let result = null;

    try{
        const response = await apiConnector("POST", GET_FULL_COURSE_DETAILS_AUTHENTICATED, {courseId},
            {
                Authorization: `Bearer ${token}`,
            }
        );

        // console.log("Course full details api response ...", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
    }
    catch(error){
        console.log("course full details api error............", error)
        result = error.response.data;
    }
    toast.dismiss(toastId);
    return result;
}

// mark a lecture as complete
export const markLectureAsComplete = async(data, token) => {
    const toastId = toast.loading("Loading...");
    let result = null;

    try{
        const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.message) {
            throw new Error(response.data.message);
        }

        toast.success("Lecture completed");
        result = true;
    }
    catch(error){
        console.log("mark lecture as complete as api error............", error);
        toast.error(error.message);
        result = false;
    }

    toast.dismiss(toastId);
    return result;
}

// create rating for course
export const createRating = async (data, token) => {
    const toastId = toast.loading("Loading....");
    let success = false;

    try{
        const response = await apiConnector("POST", CREATE_RATING_API, data, {
            Authorization: `Bearer ${token}`,
        })

        console.log("Create rating api response....", response);

        if (!response.data.message) {
            throw new Error(response.data.message);
        }

        toast.success("Rating created");
        success = true;
    }
    catch(error){
        console.log("Creating rating api error...", error);
        toast.error(error.message);
        success = false;
    }
    toast.dismiss(toastId);
    return success;
}


