import React from 'react'
import CTAButton from '../HomePage/Button';
// import HighlightText from './HighlightText';
import { FaArrowRight } from 'react-icons/fa6';
import { TypeAnimation } from 'react-type-animation';

export const CodeBlocks = ({position, heading, subheading, ctabtn1, ctabtn2, codeblock, backgroundGradient, codeColor}) => {
  return (
    <div className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}>

        {/* Section1 */}
        <div className='w-[50%] flex flex-col gap-8 lg:w-[50%]'>
            {heading}   
            <div className='text-richblack-300 text-base font-bold w-[85%] -mt-3'>
                {subheading}
            </div>

            <div className='flex gap-7 mt-7'>
                <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
                    <div className='flex gap-2 items-center'>
                        {ctabtn1.btnText}
                        <FaArrowRight/>
                    </div>
                </CTAButton>
                <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
                    {ctabtn2.btnText }
                </CTAButton>
            </div>

        </div>

        {/* section2  -- animated codes */}

        <div className='h-fit code-border flex flex-row py-3 text-[10px] sm:text-sm leading-[18px] sm:leading-6 relative w-[100%] lg:w-[470px]'>
            {backgroundGradient}
            <div className='text-center flex flex-col w-[10%] text-richblack-400 font-inter font-bold select-none'>
                <p>1</p>
                <p>2</p>
                <p>3</p>
                <p>4</p>
                <p>5</p>
                <p>6</p>
                <p>7</p>
                <p>8</p>
                <p>9</p>
                <p>10</p>
                <p>11</p>
            </div>

            <div className={`flex flex-col w-[90%] gap-2 font-bold font-inter ${codeColor} pr-2`}>
                <TypeAnimation
                    sequence={[codeblock, 2000, ""]}
                    repeat={Infinity}
                    cursor={true}
                    style={
                        {
                            display: "block",
                            whiteSpace: "pre-line",
                        }
                    }
                    omitDeletionAnimation={true}
                />
            </div>

        </div>
    </div>
  );
}
