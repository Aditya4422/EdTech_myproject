import React, { useEffect, useState } from 'react'
import logo from "../../assets/Logo/Logo-Small-Light.png";
import StudyTechLogo from '../../assets/Logo/StudyTech.png';

import { Link, matchPath } from 'react-router-dom';
import { NavbarLinks } from '../../data/navbar-links';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsCart2 } from "react-icons/bs";
import ProfileDropDown from '../core/Auth/ProfileDropDown';
import { RiArrowDownSLine } from "react-icons/ri";
import { ACCOUNT_TYPE} from '../../utils/constants';
import { AiOutlineMenu } from "react-icons/ai";
// import { fetchCourseCategories } from '../../services/operations/courseDetailAPI';
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";



function  Navbar(){

  const {token} = useSelector( (state) => state.auth );
  const {user} = useSelector( (state) => state.profile );
  const {totalItems} = useSelector( (state) => state.cart );
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    ;(async () => {
        setLoading(true);
        try{
          const res = await apiConnector("GET", categories.CATEGORIES_API);
          // console.log("after making fetchcourse categories api call ...", res);
          setSubLinks(res.data.data);    
        }
        catch(error){
          console.log("Couldnot fetch categories", error);
        }
        setLoading(false);
        // console.log("value of subLinks after setloading false...", subLinks);
    }) ()
  }, [])

  // useEffect(() => {
  //   console.log("printing values of subLinks ..", subLinks);

  // }, [subLinks]);

  const matchRoute = (route) => {
    return matchPath({path:route}, location.pathname);
  }

  return (
    <div className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 
                    ${location.pathname !== "/" ? "bg-richblack-800" : ""} transition-all duration-200`}>
      <div className='w-11/12 flex max-w-maxContent items-center justify-between'>
        
        {/* logo  */}
        <Link to="/">
          <img src={StudyTechLogo} width={180} height={42} loading='lazy' alt="EdTech"  className='aspect-square w-[52px] rounded-full object-cover'/>
        </Link>

        {/* navlinks */}

        <nav className="hidden md:block">
          <ul className='flex gap-x-6 text-richblack-25'>
            {
              NavbarLinks.map((link, index) => (
                <li key={index}>
                  {
                    link.title === 'Catalog' 
                    ? (
                        <div className={`group relative flex cursor-pointer items-center gap-1 
                          ${matchRoute("/catalog/:catalogName") ? "text-yellow-25" : "text-richblack-25"}`}
                        >
                            <p>{link.title}</p>
                            <RiArrowDownSLine />
                            
                            <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                                              
                                <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                                {
                                    loading 
                                    ? (
                                        
                                            <p className=' spinner text-center'>Loading....</p>
                                        
                                      ) 
                                    : subLinks.length ? (
                                      <>
                                        {
                                          subLinks?.filter((subLink) => subLink?.courses?.length > 0 &&  subLink?.courses.some((course) => course.status === "Published")).map((subLink, i) => (
                                              <Link
                                                to={`/catalog/${subLink?.name
                                                  .split(" ")
                                                  .join("-")
                                                  .toLowerCase()}`}
                                                className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                                key={i}
                                              >
                                                <p>{subLink?.name}</p>
                                              </Link>
                                          ))}
                                      </>
                                    ): ( <>
                                              <p className=' text-center'>No courses found</p>
                                            </>
                                      )
                                }
                            </div>
                        </div>
                    ) : (
                      <Link to={link?.path}>
                        <p className={`${matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                          {link?.title}
                        </p>
                      </Link>
                    )
                  }
                </li>
            ))}
          </ul>
        </nav>

        {/* login, signup, dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
            {
                user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                  <Link to={"/dashboard/cart"} className=' relative'>
                    <BsCart2 className="text-2xl text-richblack-100"/>
                    {
                      totalItems > 0 && (
                        <span  className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                          {totalItems}
                        </span>
                      )
                    }
                  </Link>
                )
            }

            {
              token === null && (
                <Link to={"/login"}>
                  <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                    Log in
                  </button>
                </Link>
              )
            }
            {
              token === null && (
                <Link to={'/signup'}>
                  <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md'>
                    Sign up
                  </button>
                </Link>
              )
            }
            {
              token !== null && <ProfileDropDown/>
            }

        </div>

        <button className="mr-4 md:hidden">
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>

      </div>
    </div>
  )
}

export default Navbar