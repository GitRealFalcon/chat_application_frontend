import { toggleShowSearch,toggleShowUserInfo ,toggleShowMenu,toggleProfileMenu} from '../../features/theme/themeSlice'
import { useAppDispatch, useAppSelector } from '../../App/hooks'
import { resetSearchUser } from '../../features/user/userSlice'


const Navbar = ({ activeChat, status = [], typing = [] }) => {
  const dispatch = useAppDispatch()

  const selfId = useAppSelector(state => state.auth.user?._id)
  

  
  const isOnline =
    activeChat?.chat === "direct" &&
    status?.some(user => user === activeChat?.id)
 
  

  const typingUsers =
    activeChat?.chat === "direct"
      ? typing.filter(
        (t) =>
          String(t.userId) === String(activeChat.id) &&
          String(t.userId) !== String(selfId)
      )
      : typing.filter(
        (t) =>
          String(t.chatId) === String(activeChat.id) &&
          String(t.userId) !== String(selfId)
      )



  const handleClick = () => {
    dispatch(resetSearchUser())
    dispatch(toggleShowSearch(true))
  }

  const handleToggleUserInfo = ()=>{
      dispatch(toggleShowUserInfo(true))
  }

  const handleShowMenu = ()=>{
    dispatch(toggleShowMenu(true))
  }

  const handleShowProfileMenu = ()=>{
      dispatch(toggleProfileMenu(true))
  }
  return (
    <div className='flex items-center justify-between border-b border-[#1f2c34] bg-[#202c33] px-4 py-2'>
      <div className='flex justify-center items-center gap-3'>
      <img onClick={handleShowMenu}  className='hidden cursor-pointer max-[900px]:block' src="src\assets\menu.svg" alt="menu" />
      <div onClick={handleToggleUserInfo} className='flex cursor-pointer items-center gap-3'>

        <div className='h-10 w-10 rounded-full bg-[#3b4a54] flex justify-center items-center'>
          <img src="src\assets\person.svg" alt="avatar" />
        </div>

        <div>
          <div className='text-sm font-semibold flex items-center gap-2'>
            {activeChat?.name || "Select Chat"}

            {isOnline && (
              <span className='h-2 w-2 rounded-full bg-green-500'></span>
            )}
          </div>

          <div className='text-xs text-green-400 min-h-4'>
            {typingUsers.length > 0 ? "Typing..." : ""}
          </div>

        </div>

      </div>
       </div>

      <div className='flex gap-1'>
        <button
          onClick={handleClick}
          className='cursor-pointer px-2 py-1 text-base text-[#e9edef] rounded-full hover:bg-[#2a3942]'
        >
          <img src="src/assets/search.svg" alt="search" />
        </button>

        <button onClick={handleShowProfileMenu} className='cursor-pointer px-2 py-1 font-bold text-base text-[#e9edef] rounded hover:bg-[#2a3942]'>
          ⋮
        </button>
      </div>

    </div>
  )
}

export default Navbar
