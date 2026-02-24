import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/homePage/Navbar'
import Chat from '../components/homePage/Chat'
import Input from '../components/homePage/Input'
import SearchUserComponent from '../components/chat/SearchUser'
import UserInfo from '../components/homePage/UserInfo'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../App/hooks'
import { getMessage, getGroupMessage } from '../features/chat/chatSlice'
import { getSocket } from '../services/socket/socket'
import { toggleShowSearch,toggleProfileMenu } from '../features/theme/themeSlice'
import ProfileMenu from '../components/homePage/ProfileMenu'

const TYPING_TIMER = 1000

const Home = () => {
  const dispatch = useAppDispatch()
  const socket = getSocket()


  const activeChat = useAppSelector((state) => state.chat.activeChat)
  const stateMessages = useAppSelector((state) => state.chat.messages)
  const loading = useAppSelector((state) => state.chat.loading)

  const user = useAppSelector((state) => state.auth.user)
  const onlineUser = useAppSelector((state) => state.user.onlineUser)
  const typingUser = useAppSelector((state) => state.notification.typing)
  const {showMenu,showSearch,showProfileMenu} = useAppSelector(state => state.theme)
  


  const messages = useMemo(() => {
    if (!activeChat?.id) return []
    return stateMessages?.[activeChat.id] ?? []
  }, [activeChat?.id, stateMessages])


  const [input, setInput] = useState("")
  const typingTimerRef = useRef(null)
  const isTypingRef = useRef(false)
  const searchUserRef = useRef(null)
  const menuRef = useRef(null)

  

  const contacts = user?.Chats ?? []
  const groups = user?.joinedGroup ?? []

  const allChats = useMemo(() => {
    return [...groups, ...contacts]
  }, [groups, contacts])


  useEffect(() => {
    if (!activeChat?.id) return

    if (activeChat.chat === "direct") {
      dispatch(getMessage(activeChat.id))
    }

    if (activeChat.chat === "group") {
      dispatch(getGroupMessage(activeChat.id))
    }

  }, [activeChat?.id, activeChat?.chat, dispatch])



  const emitTypingStop = () => {
    if (!isTypingRef.current || !activeChat?.id || !user?._id) return

    socket.emit("typing:stop", {
      userId: user._id,
      chatId: activeChat.id,
      chatType: activeChat.chat
    })

    isTypingRef.current = false
  }

  const handleInput = (e) => {
    const value = e.target.value
    setInput(value)

    if (!activeChat?.id || !user?._id) return


    if (!isTypingRef.current) {
      socket.emit("typing:start", {
        userId: user._id,
        chatId: activeChat.id,
        chatType: activeChat.chat
      })

      isTypingRef.current = true
    }


    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    typingTimerRef.current = setTimeout(() => {
      emitTypingStop()
    }, TYPING_TIMER)
  }


  useEffect(() => {
    return () => {
      emitTypingStop()
    }
  }, [activeChat?.id])


  useEffect(() => {
    return () => {
      emitTypingStop()
    }
  }, [])



  const onSend = () => {
    if (!activeChat?.id || !input.trim() || !user?._id) return

    emitTypingStop()

    const messagePayload = {
      msgId: crypto.randomUUID(),
      sender: user._id,
      text: input,
      ts: Date.now()
    }

    if (activeChat.chat === "direct") {
      socket.emit("direct:message", {
        ...messagePayload,
        receiver: activeChat.id
      })
    }

    if (activeChat.chat === "group") {
      socket.emit("group:message", {
        ...messagePayload,
        group: activeChat.id
      })
    }

    setInput("")
  }

  useEffect(()=>{
    const handleOutsideClick= (e)=>{
      if (searchUserRef.current && !searchUserRef.current.contains(e.target)) {
        dispatch(toggleShowSearch(false))
        
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        dispatch(toggleProfileMenu(false))
         
      }
    }

    if (showSearch || showProfileMenu) {
      document.addEventListener("mousedown",handleOutsideClick)
    }else{
      document.removeEventListener("mousedown",handleOutsideClick)
    }

    return ()=>{
      document.removeEventListener("mousedown", handleOutsideClick)
    }

  },[showSearch,showProfileMenu])
    

  return (
    <div className='grid h-screen grid-cols-[320px_1fr] bg-[#111b21] text-[#e9edef] max-[900px]:grid-cols-1'>
      <div className='max-[900px]:hidden'>
      <Sidebar Chats={allChats} />
      </div>

      <div className='flex ' >

        <main className='flex grow h-screen flex-col bg-[#0b141a]'>
          <SearchUserComponent ref={searchUserRef}/>
          
            <ProfileMenu ref={menuRef}/>
            

          {showMenu && <Sidebar Chats={allChats} />}

          <Navbar
            activeChat={activeChat}
            typing={typingUser}
            status={onlineUser}
          />

          <Chat
            Messages={messages}
            activeChat={activeChat}
            loading={loading}
            selfId={user?._id}
          />

          <Input
            onButton={onSend}
            onInput={handleInput}
            value={input}
          />
        </main>

        <UserInfo />
      </div>
    </div>
  )
}

export default Home
