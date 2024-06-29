import React from 'react'
import HighlightText from './HighlightText'
import know_your_progress from '../../../assets/Images/Know_your_progress.png';
import compare_with_others from '../../../assets/Images/Compare_with_others.png';
import plan_your_lessons from '../../../assets/Images/Plan_your_lessons.png';
import CTAButton from './Button';

const LearningLanguageSection = () => {
  return (
    
        <div className='text-4xl font-semibold text-center my-10'>
            <div className='text-4xl font-semibold text-center'>
                Your Swiss Knife for
                <HighlightText text={" learning any language"}/>
              

              <div className='text-center text-richblack-700 font-medium lg:w-[75%] mx-auto leading-6 text-base mt-3'>
                Using spin making learning multiple languages easy. with 20+
                languages realistic voice-over, progress tracking, custom schedule
                and more.
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center mt-8 lg:mt-0">
                <img className='object-contain -mr-32' src={know_your_progress} alt="know_your_progress"/>
                <img className='object-contain  lg:-mb-10 lg:-mt-0 -mt-12' src={compare_with_others} alt="compare_with_others"/>
                <img className='object-contain lg:-ml-36 lg:-mt-5 -mt-16' src={plan_your_lessons} alt="plan_your_lessons"/>
              </div>
            </div>

            <div className="w-fit mx-auto lg:mb-20 mb-8 -mt-5">
              <CTAButton active={true} linkto={"/signup"}>
                  <div className='w-fit'>
                    Learn More
                  </div>
              </CTAButton>
            </div>
            
        </div>
  )
}

export default LearningLanguageSection