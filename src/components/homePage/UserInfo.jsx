import { useAppDispatch, useAppSelector } from '../../App/hooks'
import { toggleShowUserInfo } from '../../features/theme/themeSlice'
import { forwardRef } from 'react'

const UserInfo = (ref)=> {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.chat.activeChat)
  const { showUserInfo } = useAppSelector(state => state.theme)
  const handleClose = () => {
    dispatch(toggleShowUserInfo(false))
  }
  return (
    <div className={`max-[900px]:w-screen h-screen backdrop-blur-sm max-[900px]:absolute w-[320px] ${!showUserInfo && "hidden"} `}>
      <div className=' flex justify-start items-center h-15 p-2'>
        <button className='cursor-pointer' onClick={handleClose}><img src="src/assets/close.svg" alt="close" /></button>
      </div>
      <div className=' pt-10'>
        <div className='flex flex-col gap-2 justify-center items-center'>
          <div className='w-24 h-24 border-2 rounded-full flex items-center justify-center'><img src="src/assets/person.svg" alt="person" /></div>
          <div className='font-semibold text-lg'>{user?.name}</div>
        </div>
        <div className='w-full border-b mt-3 border-gray-600'></div>
        <div className='overflow-y-auto'>

        </div>

      </div>
    </div>
  )
}

export default UserInfo
