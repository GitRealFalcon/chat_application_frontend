import { useRef, useState, useEffect ,forwardRef} from 'react'
import { useAppDispatch, useAppSelector } from '../../App/hooks'
import { searchUser, addChat } from '../../features/user/userSlice'
import { setActiveChat } from '../../features/chat/chatSlice'


const SearchUserComponent = forwardRef(function SearchUserComponent(_, ref) {
  const [text, setText] = useState("")
  const typingTimer = useRef(null)

  const dispatch = useAppDispatch()
  const searchUsers = useAppSelector(state => state.user.searchUser) ?? []
  const showSearch = useAppSelector(state => state.theme.showSearch)
  const currentUser = useAppSelector(state => state.auth.user)

    

  useEffect(() => {
    if (!showSearch) {
      setText("")
    }
  }, [showSearch])


  useEffect(() => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
    }

    typingTimer.current = setTimeout(() => {
      if (text.trim().length > 2) {
        dispatch(searchUser(text))
      }
    }, 700)

    return () => clearTimeout(typingTimer.current)
  }, [text, dispatch])

  const handleSelectUser = (user) => {
    dispatch(setActiveChat({
      id: user._id,
      chat: "direct",
      name: user.name
    }))
  }

  const handleAdd = (id) => {
    dispatch(addChat({contact:id}))
  }

  return (
    <div
    ref={ref}
      className={`absolute right-5 top-16 w-1/3 ${showSearch ? "block" : "hidden"
        }`}
    >
      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='w-full rounded-lg border border-[#aebac185] p-2 px-3'
          placeholder='Search user'
          type="text"
        />
      </div>

      {searchUsers.length > 0 && (
        <div className='mt-2 flex flex-col gap-2 rounded-lg border border-[#aebac134] p-2'>
          {searchUsers.map(user => {
            const isExist = currentUser.Chats?.some(each => each._id === user._id)
            
            return (<div className='flex gap-3 justify-center items-center' key={user._id}>
              <span
                onClick={() =>handleSelectUser(user)}
                className='cursor-pointer rounded-lg grow bg-[#aebac11e] p-2 px-3 text-[#aebac1be] hover:bg-[#2a3942]'
              >
                {user.name}
              </span>
              {!isExist && <div onClick={handleAdd(user._id)} className='px-2 py-1 font-bold text-base text-[#e9edef] rounded hover:bg-[#2a3942]'>+</div>}
            </div>)
          }
          )
          }
        </div>
      )}
    </div>
  )
})

export default SearchUserComponent
