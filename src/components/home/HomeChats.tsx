import React, { useEffect, useRef } from 'react'
import HomeInput from './HomeInput'
import { ScrollArea } from '../ui/scroll-area'
import ChatSkeleton from './skeletons/ChatSkeleton'
import { useAppSelector } from '@/App/hooks'
import chatBgWhite from '@/assets/chatBG-white.jpg'
import chatBgBlack from '@/assets/chatBG-black.jpg'

type Message = {
    msgId: string
    sender: string
    receiver?: string
    groupId?:string
    text: string
    ts: string
}



const HomeChats = () => {
   const {loading,messages,activeChat} = useAppSelector(state => state.chat)
   const user = useAppSelector(state => state.auth.user)
   const chatMessages = messages[activeChat._id] ?? []
   const bottomRef = useRef(null)

   useEffect(()=>{
    bottomRef?.current.scrollIntoView({ behavior: "smooth" })
   },[chatMessages])
    const formatTime = (ts: string | Date) => {
        if (!ts) return ""
        return new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <div className='relative flex min-h-0 grow flex-col'>
            <img
                src={chatBgWhite}
                alt=""
                aria-hidden="true"
                className='pointer-events-none absolute inset-0 h-full w-full object-cover dark:hidden'
            />
            <img
                src={chatBgBlack}
                alt=""
                aria-hidden="true"
                className='pointer-events-none absolute inset-0 hidden h-full w-full object-cover dark:block'
            />

            <ScrollArea className='relative min-h-0 flex-1'>
                <div className='flex flex-col gap-3 p-4 '>
                    {loading && Array.from({length:6},(_, index)=>(
                            <ChatSkeleton value={index} />
                    ))}

                    {!loading && chatMessages.map((message) => {
                        const isMe = user._id === message.sender

                        return (
                            <div
                                key={message.msgId}
                                className={`flex max-w-[70%] flex-col ${isMe ? "self-end" : "self-start"}`}
                            >
                                <div
                                    className={`rounded-b-lg px-3 py-2 text-white text-sm ${isMe ? "bg-[#005c4b] rounded-l-lg" : "bg-[#202c33] rounded-r-lg"
                                        }`}
                                >
                                    {message.text}
                                </div>

                                <div
                                    className={`mt-1 text-[11px] text-muted-foreground ${isMe ? "text-right" : "text-left"
                                        }`}
                                >
                                    {formatTime(message.ts)}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
            <HomeInput />
        </div>
    )
}

export default HomeChats
