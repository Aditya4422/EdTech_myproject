import React from 'react'
// import { IoMdPeople } from "react-icons/io";

const CourseCard = (cardData, currentCard , setCurrentCard) => {
  return (
    <div className='text-white bg-richblack-200'>
        <div>
            {cardData.heading}
        </div>

        <div>
            {cardData.description}
        </div>

        <div>
            <div>
                {cardData.level}
            </div>
            <div>
                {cardData.lessonNumber}
            </div>
        </div>

    </div>
  )
}

export default CourseCard