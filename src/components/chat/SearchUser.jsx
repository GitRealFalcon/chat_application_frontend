import { useRef, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../App/hooks'
import { searchUser } from '../../features/user/userSlice'
import { setActiveChat } from '../../features/chat/chatSlice'

const SearchUserComponent = () => {
  const [text, setText] = useState("")
  const typingTimer = useRef(null)

  const dispatch = useAppDispatch()

  const searchUsers = useAppSelector(state => state.user.searchUser) ?? []
  const showSearch = useAppSelector(state => state.theme.showSearch)

 
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

  return (
    <div
      className={`absolute right-5 top-16 w-1/3 ${
        showSearch ? "block" : "hidden"
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
          {searchUsers.map(user => (
            <span
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className='cursor-pointer rounded-lg bg-[#aebac11e] p-2 px-3 text-[#aebac1be] hover:bg-[#2a3942]'
            >
              {user.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchUserComponent
