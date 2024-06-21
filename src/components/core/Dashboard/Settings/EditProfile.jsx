import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile } from '../../../../services/operations/SetttingsAPI';
import IconBtn from '../../../common/IconBtn';

const genders = ["Male", "Female", "Non-Binary", "Prefer Not to say", "Others"]

const EditProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {register, handleSubmit, formState:{errors}}  = useForm();

  const submitProfileForm = async (data) => {
    try{
      dispatch(updateProfile(token, data));
    }
    catch(error){
      console.log("can't submit form the edit profile form : ", error.message);
    }
  }

  return (
    <div>
        <form onSubmit={handleSubmit(submitProfileForm)}>
              <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
                  <h2 className="text-lg font-semibold text-richblack-5">Profile Information</h2>

                  <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="firstName" className='label-style'>First Name</label>
                          <input type="text" name='firstName' id='firstName'
                                 placeholder='Enter your First Name' className='form-style'
                                 {...register("firstName", {required: true})}
                                 defaultValue={user?.firstName}
                          />
                          {
                            errors.firstName && (
                                    <><span className="-mt-1 text-[12px] text-yellow-100">Please Enter your First Name</span></>
                                  )
                          }
                      </div>

                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="lastName" className='label-style'>Last Name</label>
                          <input type="text" name='lastName' id='lastName'
                                 placeholder='Enter your Last Name' className='form-style'
                                 {...register("lastName", {required: true})}
                                 defaultValue={user?.lastName}
                          />
                          {
                            errors.lastName && (
                                    <><span className="-mt-1 text-[12px] text-yellow-100">Please Enter your Last Name</span></>
                                  )
                          }
                      </div>
                  </div>

                  <div className="flex flex-col gap-5 lg:flex-row">              
                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="dateOfBirth" className='label-style'>Date of Birth</label>
                          <input  type="date" name='dateOfBirth' id='dateOfBirth' className='form-style'
                                  {...register("dateOfBirth", { required:{value: true, message: "Please Enter your Date of Birth"},
                                                                max: {value: new Date().toISOString().split('T')[0], message: "Date of Birth cannot be in the future."}
                                                              })}  defaultValue={user?.additionalDetails?.dateOfBirth}
                          />
                          {
                            errors.dateOfBirth && (
                              <><span className="-mt-1 text-[12px] text-yellow-100">{errors.dateOfBirth.message}</span></>
                            )
                          }
                      </div>

                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="gender" className=' label-style'>Gender</label>
                          <select type="text" name="gender" id="gender" className='form-style'
                                  {...register("gender", {required: true})} defaultValue={user?.additionalDetails?.gender}
                          >
                              {
                                genders.map((ele, i) => {
                                  return (
                                    <option value={ele} key={i}>{ele}</option>
                                  )
                                })
                              }
                          </select>
                          {
                            errors.gender && (
                              <><span className="-mt-1 text-[12px] text-yellow-100">Please select your Gender</span></>
                            )
                          }
                      </div>
                  </div>

                  <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="contactNumber" className='label-style'>Contact Number</label>
                          <input  type='tel' name='contactNumber' id='contactNumber' className='form-style' placeholder="+91 1234567890"
                                  {...register("contactNumber", { required:{value: true, message: "Please Enter your Contact Number"},
                                                                  maxLength: {value: 12, message: "Invalid Contact Number"},
                                                                  minLength: {value: 10, message: "Invalid Contact Number"}  
                                                                })}  defaultValue={user?.additionalDetails?.contactNumber}
                          />
                          {
                            errors.contactNumber && (
                              <><span className="-mt-1 text-[12px] text-yellow-100">{errors.contactNumber.message}</span></>
                            )
                          }
                      </div>

                      <div className="flex flex-col gap-2 lg:w-[48%]">
                          <label htmlFor="about" className=' label-style'>About</label>
                          <input type="text" name="about" id="about" className='form-style' placeholder='Enter Bio Details'
                                  {...register("about", {required: true})} defaultValue={user?.additionalDetails?.about}
                          />
                          {
                            errors.about && (
                              <><span className="-mt-1 text-[12px] text-yellow-100">Please enter your bio Details</span></>
                            )
                          }
                      </div>
                  </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={()=>{navigate("/dashboard/my-profile")}} className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50">
                  Cancel
                </button>
                <IconBtn type="submit" text="Save"/>
              </div>
        </form>
    </div>
  )
}

export default EditProfile