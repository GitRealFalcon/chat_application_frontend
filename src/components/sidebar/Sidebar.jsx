import { useAppDispatch, useAppSelector } from '../../App/hooks'
import { setActiveChat } from '../../features/chat/chatSlice'

const Sidebar = ({ Chats = [] }) => {
  const dispatch = useAppDispatch()
  const activeChat = useAppSelector(state => state.chat.activeChat)
  const messages = useAppSelector(state => state.chat.messages)

  const handleSelect = (chat) => {
    dispatch(setActiveChat({
      id: chat._id,
      chat: chat.admins ? "group" : "direct",
      name: chat.name
    }))
  }

  const getLastMessage = (chatId) => {
    const chatMessages = messages?.[chatId]
    if (!chatMessages || chatMessages.length === 0) return ""
    return chatMessages[chatMessages.length - 1]?.text
  }

  return (
    <aside className='flex flex-col border-r border-[#1f2c34] bg-[#111b21] max-[900px]:hidden'>

      <div className='flex items-center justify-between px-4 py-3'>
        <div className='text-lg font-serif text-green-500 font-bold'>
          Chattify
        </div>
        <button className='px-2 py-1 font-bold text-base text-[#e9edef] hover:bg-[#202c33] rounded'>
          ⋮
        </button>
      </div>

      <div className='px-3 pb-2'>
        <input
          className='w-full rounded-lg border border-[#1f2c34] bg-[#202c33] px-3 py-2 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]'
          placeholder='Search or start new chat'
        />
      </div>

      <div className='overflow-y-auto'>

        {Chats.map(chat => {
          const isActive = activeChat?.id === chat._id

          return (
            <div
              key={chat._id}
              onClick={() => handleSelect(chat)}
              className={`flex cursor-pointer gap-3 px-4 py-3 
                ${isActive ? "bg-[#2a3942]" : "hover:bg-[#1f2c34]"}`}
            >
              <div className='h-11 w-11 shrink-0 rounded-full bg-[#3b4a54]' />

              <div className='flex-1'>
                <div className='flex items-center justify-between text-sm font-semibold'>
                  <span>{chat.name}</span>
                </div>

                <div className='mt-1 text-sm text-[#8696a0] truncate'>
                  {getLastMessage(chat._id) || "No messages yet"}
                </div>
              </div>
            </div>
          )
        })}

      </div>
    </aside>
  )
}

export default Sidebar
