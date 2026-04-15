import React, { useEffect, useMemo, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Archive, BookOpen, Bot, Box, ChevronDown, ChevronRight, ChevronUp, FileText, Home, Inbox, LogOut, Plus, Send, Settings, SlidersHorizontal, SquareTerminal, Trash2, User, User2, UserRoundCheck, UserRoundMinus, UserRoundPen, UserRoundX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ProfileSheet } from './ProfileSheet'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import { getMessage, setActiveChat, updateMessageStatus } from '@/features/chat/chatSlice'
import type { Message } from '@/types/Message'
import { directTyping } from '@/utils/helpers'
import axiosInstance from '@/services/API/axiosInstans'
import chatRoundIcon from '@/assets/chat-round.svg'
import ChatRequestSheet from './ChatRequestSheet'
import SettingSheet from './SettingSheet'
import BlockSheet from './BlockSheet'
import { logoutUser } from '@/features/auth/authSlice'



type contact = {
  title: string,
  _id: string,
  avatar?: string,
  lastMessage?: string,
  time?: string,
  unread?: number,
  online?: boolean

}



const HomeSidebar = () => {
  const [contacts, setContacts] = useState<contact[]>([])
  const dispatch = useAppDispatch()
  const Chats = useAppSelector(state => state.auth.user?.Chats)
  const user = useAppSelector(state => state.auth.user)
  const onlineUser = useAppSelector(state => state.user.onlineUser)
  const { messages, activeChat } = useAppSelector(state => state.chat)
  const { typing } = useAppSelector(state => state.notification)



  useEffect(() => {
    if (Chats) {
      Chats.forEach(each => dispatch(getMessage(each._id)))
    }
  }, [Chats, dispatch])

  const GetContacts = (): contact[] => {
    if (!Chats) {
      return []
    }

    return Chats.map(contact => {
      return {
        title: contact.name,
        _id: contact._id,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      } as contact
    })
  }

  useEffect(() => {
    setContacts(GetContacts())
  }, [Chats, messages])

  const handleContactChat = (contact: contact) => {
    dispatch(setActiveChat({
      _id: contact._id,
      chat: "direct",
      title: contact.title,
      avatar: contact.avatar
    }))
    dispatch(updateMessageStatus(contact._id))
    dispatch(getMessage(contact._id))

  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <Sidebar collapsible='icon'>
      {/* Sidebar Header */}
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="
          h-12 rounded-xl px-2
          group-data-[collapsible=icon]:size-16
          group-data-[collapsible=icon]:p-0
          group-data-[collapsible=icon]:justify-center
        "
            >
              <Link
                to="/"
                className="
            flex w-full items-center gap-3
            group-data-[collapsible=icon]:justify-center
          "
              >
                <Avatar className="size-8 shrink-0 rounded-full overflow-hidden">
                  <AvatarImage
                    src={chatRoundIcon}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback>LG</AvatarFallback>

                </Avatar>

                <span className="text-[#147658] text-xl font-bold group-data-[collapsible=icon]:hidden">
                  Chattify
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>



      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>

          <SidebarMenu className="gap-2">
            {contacts && contacts.map((item) => {
              const chatMessages = messages[item._id] ?? []
              const lastChatMessage = chatMessages[chatMessages.length - 1]
              const receivedMessage = chatMessages.filter(message => message.sender !== user._id)
              const unread = receivedMessage.filter(message => message.status === 'sent').length
              const time = lastChatMessage?.ts
                ? new Date(lastChatMessage.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''
              return (<SidebarMenuItem onClick={() => handleContactChat(item)} key={item._id}>
                <SidebarMenuButton
                  isActive={activeChat._id === item._id}
                  asChild
                  tooltip={item.title}
                  className="
              h-16 rounded-xl px-2
              group-data-[collapsible=icon]:size-16
              group-data-[collapsible=icon]:p-0
              group-data-[collapsible=icon]:justify-center
              capitalize
              cursor-pointer
            "
                >
                  <div

                    className="
                flex w-full items-center gap-3
                group-data-[collapsible=icon]:justify-center
              "
                  >
                    <Avatar size='lg' className="size-10 shrink-0 rounded-full ">
                      <AvatarImage
                        src={item.avatar}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback>
                        {item.title.slice(0, 2)}
                      </AvatarFallback>
                      <AvatarBadge className={`${onlineUser.includes(item._id) && "bg-green-600 dark:bg-green-800"} `} />
                    </Avatar>

                    <div className="flex min-w-0 gap-0.5 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`${directTyping(typing, item._id) ? "text-green-500" : "text-muted-foreground"} truncate text-xs `}>
                          {directTyping(typing, item._id) ? "Typing..." : lastChatMessage?.text ?? ''}
                        </span>

                        {unread > 0 && (
                          <SidebarMenuBadge className="bg-green-800  text-white rounded-full">
                            {unread}
                          </SidebarMenuBadge>
                        )}
                      </div>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t ">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="
              h-12 rounded-xl px-2
              group-data-[collapsible=icon]:size-16
              group-data-[collapsible=icon]:p-0
              group-data-[collapsible=icon]:justify-center
              cursor-pointer
            "
                >
                  <div
                    className="
                flex w-full items-center gap-3
                group-data-[collapsible=icon]:justify-center
              "
                  >
                    <Avatar className="size-8 shrink-0 rounded-full">
                      <AvatarImage
                        src="https://github.com/shadcn.png" alt="@shadcn"
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>

                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {user?.name}
                    </span>

                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="top"
                className="w-56"
              >
                <ProfileSheet
                  trigger={
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <User2 className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                  }
                />

                <ChatRequestSheet
                  trigger={
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <UserRoundPen className="mr-2 size-4" />
                      Chat Request
                    </DropdownMenuItem>
                  }
                />

                <BlockSheet
                  trigger={
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <UserRoundX className="mr-2 size-4" />
                      Block List
                    </DropdownMenuItem>
                  }
                />


                <SettingSheet
                  trigger={
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      <Settings className="mr-2 size-4" />
                      Setting
                    </DropdownMenuItem>
                  }
                />

                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 size-4" />
                  <span>LogOut</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default HomeSidebar


