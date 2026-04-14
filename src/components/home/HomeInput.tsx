import React, { useRef, useState } from 'react'
import { Input } from '../ui/input'
import { Plus, SendHorizonal } from 'lucide-react'
import { Button } from '../ui/button'
import { getSocket } from '@/services/socket/socket'
import { useAppSelector } from '@/App/hooks'


const HomeInput = () => {
    const [text, setText] = useState("")
    const activeChat = useAppSelector(state => state.chat.activeChat)
    const user = useAppSelector(state => state.auth.user)
    const timeOutRef = useRef(null)
    const isTypingRef = useRef(false)
    const socket = getSocket()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
        
        if (!activeChat || !user) return
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit("typing:start", {
                userId: user._id,
                chatId: activeChat._id,
                chatType: activeChat.chat,
            });
        }
        if (timeOutRef.current) clearTimeout(timeOutRef.current);

        timeOutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.emit("typing:stop", {
                userId: user._id,
                chatId: activeChat._id,
                chatType: activeChat.chat,
            });
        }, 1000);
    }

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!text.trim() || !user || !activeChat) return

        const messagePayload = {
            msgId: crypto.randomUUID(),
            sender: user._id,
            text: text,
            ts: Date.now()
        }

        if (activeChat.chat === "direct") {
            socket.emit("direct:message", {
                ...messagePayload,
                receiver: activeChat._id
            })
        }

        if (activeChat.chat === "group") {
            socket.emit("group:message", {
                ...messagePayload,
                group: activeChat._id
            })
        }

        setText("")
    }
    return (
        <div className='w-full  p-4'>
            <form onSubmit={handleSubmit} className='flex border-2  rounded-4xl transition-colors bg-muted p-1 items-center'>
                <div className=' rounded-full flex items-center hover:bg-muted h-10 w-10'><Plus className='mx-auto' /></div>
                <input value={text} onChange={handleChange} type="text" className='grow outline-none px-3 placeholder:text-muted-foreground  placeholder:font-semibold text-foreground' placeholder='Type a message' />
                <Button type='submit' className='bg-green-700 rounded-full flex items-center  h-10 w-10'><SendHorizonal className='mx-auto text-black fill-black' /></Button>
            </form>
        </div>
    )
}

export default HomeInput
