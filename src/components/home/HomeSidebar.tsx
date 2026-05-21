import { useEffect } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { BadgeAlert, BadgeCheck, ChevronUp, LogOut, Settings, User2, UserRoundPen, UserRoundX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ProfileSheet } from './ProfileSheet'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import {
  fetchConversationMessages,
  fetchConversations,
  selectActiveConversationId,
  selectConversations,
  selectIsConversationsLoading,
  setActiveChat,
  setActiveConversationId,
} from '@/features/chat/chatSlice'
import { selectAuthUser } from '@/features/auth/authSlice'
import { selectOnlineUsers } from '@/features/user/userSlice'
import { selectTypingUsers } from '@/features/notification/notificationSlice'
import { directTyping } from '@/utils/helpers'
import chatRoundIcon from '@/assets/chat-round.svg'
import ChatRequestSheet from './ChatRequestSheet'
import SettingSheet from './SettingSheet'
import BlockSheet from './BlockSheet'
import { logoutUser } from '@/features/auth/authSlice'
import { Badge } from '../ui/badge'
import { createOrGetDirectConversationAPI } from '@/features/chat/chatAPI'
import { toast } from 'sonner'

const HomeSidebar = () => {
  const dispatch = useAppDispatch()
  const conversations = useAppSelector(selectConversations)
  const user = useAppSelector(selectAuthUser)
  const onlineUser = useAppSelector(selectOnlineUsers)
  const activeConversationId = useAppSelector(selectActiveConversationId)
  const isConversationsLoading = useAppSelector(selectIsConversationsLoading)
  const typing = useAppSelector(selectTypingUsers)

  useEffect(() => {
    dispatch(fetchConversations({ limit: 20 }))
  }, [dispatch])

  const extractConversationIdFromDirectResponse = (response: unknown): string | null => {
    if (!response || typeof response !== 'object') return null

    const root = response as Record<string, unknown>
    const data = root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : undefined

    const candidates: Array<unknown> = [
      root.conversationId,
      data?.conversationId,
      root._id,
      data?._id,
      root.conversation,
      data?.conversation,
      data?.data,
    ]

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate
      }

      if (candidate && typeof candidate === 'object') {
        const record = candidate as Record<string, unknown>
        if (typeof record._id === 'string' && record._id.length > 0) {
          return record._id
        }
        if (typeof record.conversationId === 'string' && record.conversationId.length > 0) {
          return record.conversationId
        }
        if (record.conversation && typeof record.conversation === 'object') {
          const nested = record.conversation as Record<string, unknown>
          if (typeof nested._id === 'string' && nested._id.length > 0) {
            return nested._id
          }
        }
      }
    }

    return null
  }

  const resolveDirectConversationId = async (participantId: string) => {
    try {
      const res = await createOrGetDirectConversationAPI(participantId)
      return extractConversationIdFromDirectResponse(res)
    } catch {
      return null
    }
  }

  const handleContactChat = async (conversation: (typeof conversations)[number]) => {
    const displayName = conversation.title ?? conversation.name ?? conversation._id
    const avatar = conversation.avatar ?? `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    const chatType = conversation.chat ?? (conversation.isGroup ? 'group' : 'direct')
    const participantId = conversation.participantId
    const isLegacyDirect = chatType === 'direct' && typeof participantId === 'string' && participantId.length > 0
    const conversationId =
      isLegacyDirect
        ? await resolveDirectConversationId(participantId)
        : conversation._id

    const fallbackDirectConversationId = isLegacyDirect ? participantId : null
    const finalConversationId = conversationId ?? fallbackDirectConversationId

    if (!finalConversationId) {
      toast.error('Unable to resolve conversation. Please try again.', { position: 'top-right' })
      return
    }

    if (!conversationId && isLegacyDirect) {
      toast.info('Opening chat. Conversation will be created on first message.', { position: 'top-right' })
    }

    dispatch(
      setActiveChat({
        _id: finalConversationId,
        chat: chatType,
        title: displayName,
        avatar,
        participantId,
      })
    )
    dispatch(setActiveConversationId(finalConversationId))
    if (!isLegacyDirect || conversationId) {
      dispatch(fetchConversationMessages({ conversationId: finalConversationId, mode: 'initial' }))
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-12 rounded-xl px-2 group-data-[collapsible=icon]:size-16 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            >
              <Link
                to="/"
                className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center"
              >
                <Avatar className="size-8 shrink-0 rounded-full overflow-hidden">
                  <AvatarImage src={chatRoundIcon} className="h-full w-full object-cover" />
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>

          <SidebarMenu className="gap-2">
            {isConversationsLoading && conversations.length === 0 && (
              <SidebarMenuItem>
                <div className="px-3 py-2 text-sm text-muted-foreground">Loading chats...</div>
              </SidebarMenuItem>
            )}

            {conversations.map((conversation) => {
              const chatMessages = conversation.lastMessage ? [conversation.lastMessage] : []
              const lastChatMessage = chatMessages[chatMessages.length - 1] ?? conversation.lastMessage
              const time = lastChatMessage?.ts
                ? new Date(lastChatMessage.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''
              const unread = conversation.unreadCount ?? 0
              const displayName = conversation.title ?? conversation.name ?? conversation._id
              const avatar = conversation.avatar ?? `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`

              return (
                <SidebarMenuItem onClick={() => void handleContactChat(conversation)} key={conversation._id}>
                  <SidebarMenuButton
                    isActive={activeConversationId === conversation._id}
                    asChild
                    tooltip={displayName}
                    className="h-16 rounded-xl px-2 group-data-[collapsible=icon]:size-16 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center capitalize cursor-pointer"
                  >
                    <div className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
                      <Avatar size='lg' className="size-10 shrink-0 rounded-full">
                        <AvatarImage src={avatar} className="h-full w-full object-cover" />
                        <AvatarFallback>{displayName.slice(0, 2)}</AvatarFallback>
                        <AvatarBadge className={`${onlineUser.includes(conversation._id) && 'bg-green-600 dark:bg-green-800'} `} />
                      </Avatar>

                      <div className="flex min-w-0 gap-0.5 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between">
                          <span className="truncate font-medium">{displayName}</span>
                          <span className="text-xs text-muted-foreground">{time}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`${directTyping(typing, conversation._id) ? 'text-green-500' : 'text-muted-foreground'} truncate text-xs`}>
                            {directTyping(typing, conversation._id)
                              ? 'Typing...'
                              : lastChatMessage?.text ?? ''}
                          </span>

                          {unread > 0 && (
                            <SidebarMenuBadge className="bg-green-800 text-white rounded-full">
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

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 rounded-xl px-2 group-data-[collapsible=icon]:size-16 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center cursor-pointer">
                  <div className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="size-8 shrink-0 rounded-full">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>

                    <span className="truncate font-bold flex items-center gap-1 capitalize group-data-[collapsible=icon]:hidden">
                      {user?.name} {user.isVerified ? (
                        <Badge variant="secondary">
                          <BadgeCheck data-icon="inline-start" />
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <BadgeAlert data-icon="inline-start" />
                        </Badge>
                      )}
                    </span>

                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" side="top" className="w-56">
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
