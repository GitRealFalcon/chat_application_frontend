import React, { useEffect, useRef } from 'react'
import HomeInput from './HomeInput'
import { ScrollArea } from '../ui/scroll-area'
import ChatSkeleton from './skeletons/ChatSkeleton'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import chatWhite from "@/assets/chatBG-white.jpg";
import chatBlack from "@/assets/chatBG-black.jpg";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'
import { Check, CheckCheck, Copy, Forward, PencilIcon, ShareIcon, TrashIcon } from 'lucide-react'
import { deleteOneMessage, deleteOneMessageReducer } from '@/features/chat/chatSlice'
import { toast } from 'sonner'
import Linkify from "linkify-react"


type Message = {
    msgId: string
    sender: string
    receiver?: string
    groupId?: string
    text: string
    ts: string
}



const HomeChats = () => {
    const { loading, messages, activeChat } = useAppSelector(state => state.chat)
    const user = useAppSelector(state => state.auth.user)
    const chatMessages = messages[activeChat._id] ?? []
    const bottomRef = useRef(null)
    const dispatch = useAppDispatch()

    const options = {
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-green-600 underline"
    }

    useEffect(() => {
        bottomRef?.current.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages])
    const formatTime = (ts: string | Date) => {
        if (!ts) return ""
        return new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const handleDeleteOne = async (chatId: string, msgId: string) => {
        try {
            await dispatch(deleteOneMessage(msgId)).unwrap()
            dispatch(deleteOneMessageReducer({ chatId, msgId }))
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error
            ) {
                toast.error(String((error as any).message), { position: "top-right" })
            } else {
                toast.error("Something went wrong", { position: "top-right" })
            }
        }
    }

    const handleCopy = (text: string) => {
        window.navigator.clipboard.writeText(text)
        toast.success(`Message copied`, { position: "top-right" })
    }

    return (
        <div className='flex min-h-0 grow flex-col bg-repeat
    bg-[length:320px] bg-[url("/chatBG-white.jpg")] dark:bg-[url("/chatBG-black.jpg")]'>
            <ScrollArea className='min-h-0 flex-1'>
                <div className='flex flex-col gap-3 p-4 '>
                    {loading && Array.from({ length: 6 }, (_, index) => (
                        <ChatSkeleton value={index} />
                    ))}

                    {!loading && chatMessages.map((message) => {
                        const isMe = user._id === message.sender

                        return (
                            <ContextMenu>
                                <ContextMenuTrigger key={message.msgId} className={`flex max-w-[70%] flex-col ${isMe ? "self-end" : "self-start"}`}>
                                    <div

                                    >
                                        <div
                                            className={`rounded-b-lg px-2 py-1 text-white text-sm ${isMe ? "bg-[#005c4b] rounded-l-lg" : "bg-[#202c33] rounded-r-lg"
                                                }`}
                                        >
                                            <div className='mr-5'>
                                                <Linkify options={options}>
                                                    {message.text}
                                                </Linkify>
                                            </div>

                                            <div
                                                className={`flex text-[11px] gap-0.5 text-muted-foreground justify-end items-center`}
                                            >
                                                {formatTime(message.ts)} <div className={`${!isMe && "hidden"} flex items-center`} ><CheckCheck className={`size-4 ${message.status !== "sent" && "hidden"}`}/><CheckCheck  className={`size-4 ${message.status !== "read" && "hidden"} text-blue-500`}/></div>
                                            </div>
                                        </div>


                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuGroup>
                                        <ContextMenuItem onClick={() => handleCopy(message.text)}>
                                            <Copy />
                                            Copy
                                        </ContextMenuItem>
                                        <ContextMenuItem>
                                            <Forward />
                                            Forward
                                        </ContextMenuItem>
                                    </ContextMenuGroup>
                                    <ContextMenuSeparator />
                                    <ContextMenuGroup>
                                        <ContextMenuItem onClick={() => handleDeleteOne(activeChat._id, message.msgId)} variant="destructive">
                                            <TrashIcon />
                                            Delete
                                        </ContextMenuItem>
                                    </ContextMenuGroup>
                                </ContextMenuContent>
                            </ContextMenu>

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
