import React,{forwardRef} from 'react'
import { useAppDispatch,useAppSelector } from '../../App/hooks'
import { logoutUser } from '../../features/auth/authSlice'

const ProfileMenu = forwardRef(function ProfileMenu(_, ref){
  const user = useAppSelector(state => state.auth.user)
  const showProfileMenu = useAppSelector(state => state.theme.showProfileMenu)
  const dispatch = useAppDispatch()
  const handleLogout = ()=>{
      dispatch(logoutUser())
  }
  return (
    <div ref={ref} className={`${!showProfileMenu && "hidden"} absolute right-2 top-15 bg-[#111b21] w-fit border border-gray-500 rounded-xl gap-1 flex flex-col p-2`}>
      <h3 className='bg-[#202c33] cursor-pointer hover:bg-[#19262e] p-2 py-1 rounded-lg font-bold text-emerald-500'>{user.name}</h3>
      <div className='bg-[#202c33] cursor-pointer hover:bg-[#19262e] px-2 py-1 rounded-lg font-semibold'>Create Group</div>
      <div onClick={handleLogout} className='bg-[#202c33] cursor-pointer hover:bg-[#19262e] px-2 py-1 rounded-lg font-semibold text-red-500'>Logout</div>
    </div>
  )
})

export default ProfileMenu
