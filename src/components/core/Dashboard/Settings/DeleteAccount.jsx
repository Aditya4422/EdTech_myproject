import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { deleteProfile } from '../../../../services/operations/SetttingsAPI';
import { FiTrash2 } from 'react-icons/fi';
import ConfirmationModal from '../../../common/ConfirmationModal';

const DeleteAccount = () => {
  const {token} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  const handleDeleteAccount = async () => {
    try{
      setConfirmationModal({
        text1: "Are you sure to delete your Account?",
        text2: "All your purchased courses will be deleted and your all information will also be deleted.",
        btn1Text: "Delete",
        btn2Text: "Cancel",
        btn1Handler: () => dispatch(deleteProfile(token, navigate)),
        btn2Handler: () => setConfirmationModal(null),
      })
      
    }
    catch(error){
      console.log("Can't delete the user account ", error.message);
    }
  }

  return (
    <>
    <div className="my-10 flex flex-row gap-x-5 rounded-md border-[1px] border-pink-700 bg-pink-900 p-8 px-12">
        <div className="flex aspect-square h-14 w-14 items-center justify-center rounded-full bg-pink-700">
            <FiTrash2 className="text-3xl text-pink-200"/>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-richblack-5">Delete Account</h2>

          <div className="w-3/5 text-pink-25">
              <p>Would you like to delete account ?</p>
              <p>This account may contain Paid Courses. Deleting your account is permanent and will remove all the content associated with it.</p>
          </div>

          <button type='button' onClick={handleDeleteAccount} className=' w-fit cursor-pointer italic text-pink-300'>
            I want to delete my account
          </button>
        </div>
    </div>
    {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default DeleteAccount