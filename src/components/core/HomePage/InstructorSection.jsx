import React from 'react'
import Instructor from '../../../assets/Images/Instructor.png';
import HighlightText from './HighlightText';
import CTAButton from './Button';
import { FaArrowRight } from 'react-icons/fa';
const InstructorSection = () => {
  return (
    <div className='flex  flex-col lg:flex-row gap-20 items-center mt-14'>

        <div className=' lg:w-[50%]'>
            <img src={Instructor} alt="Instructor" className='shadow-white shadow-[-20px_-20px_0_0]'/>
        </div>

        <div className='flex flex-col  lg:w-[50%] gap-10'>
            <div className='text-4xl font-semibold  lg:w-[50%]'>
                    Become an <HighlightText text={"Instructor"}/>
            </div>
            <div className='font-medium text-[16px] text-justify w-[80%] text-richblack-300'>
                Instructors from around the world teach millions of students on this platform. We provide the tools and skills to teach what you love.
            </div>
            
            <CTAButton active={true} linkto={"/signup"}>
                <div className='flex flex-row items-center gap-2'>
                    Start Teaching Today
                    <FaArrowRight/>
                </div>
            </CTAButton>
                
            
        </div>
    </div>
  )
}

export default InstructorSection