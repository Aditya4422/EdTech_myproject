import React, { useEffect, useState } from 'react';
import GetAvgRating from '../../../utils/avgRating';
import { Link } from 'react-router-dom';
import RatingStars from '../../common/RatingStars';

const Course_Card = ({course, Height}) => {

    const [avgReviewCount, setAvgReviewCount] = useState(0);
    useEffect(()=>{
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgReviewCount(count);
    }, [course]);

  return (
    <div>
        <Link to={`/courses/${course._id}`}>
            <div>
                <div>
                    <img src={course?.thumbnail} alt="Thumbnail" className={`${Height} w-full rounded-xl object-cover`}/>
                </div>
                <div>
                    <p>{course?.courseName}</p>
                    <p>{course?.instructor?.firstName} {course?.instructor?.lastName}</p>
                    <div className='flex gap-x-3'>
                        <span>{avgReviewCount}</span>
                        <RatingStars Review_count={avgReviewCount}/>
                        <span>{course?.ratingAndReviews?.length} Ratings</span>
                    </div>
                    <p>{course?.price}</p>
                </div>
            </div>
        </Link>
    </div>
  )
}

export default Course_Card