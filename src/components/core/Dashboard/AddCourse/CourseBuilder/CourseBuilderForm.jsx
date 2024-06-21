
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { createSection, updateSection } from '../../../../../services/operations/courseDetailAPI';
import { setCourse } from '../../../../../slices/courseSlice';

const CourseBuilderForm = () => {

    const { register, handleSubmit, setValue, formState:{errors} } = useForm();
    const {course} = useSelector((state) => state.course);
    const {token} = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [editSectionName, setEditSectionName] = useState(null);
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        setLoading(true);
        let result;

        if(editSectionName){
            result = await updateSection(
                {
                    sectionName: data.sectionName,
                    sectionId: editSectionName,
                    courseId: course._id,
                },
                token
            )
        }
        else{
            result = await createSection(
                {
                    sectionName: data.sectionName,
                    courseId: course._id,
                },
                token
            )
        }

        if(result){
            dispatch(setCourse(result));
            setEditSectionName(null);
            setValue("sectionName", "");
        }
        setLoading(false);
    }

    const cancelEdit = () => {
        setEditSectionName(null);
        setValue("sectionName", "");
    }

    const handleChangeEditSectionName = (sectionId, sectionName) => {
        if(editSectionName === sectionId){
            cancelEdit();
            return;
        }
        setEditSectionName(sectionId);
        setValue("sectionName", sectionName);
    }
 
  return (
    <div>
        
    </div>
  )
}

export default CourseBuilderForm


