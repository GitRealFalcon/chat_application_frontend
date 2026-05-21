import { useEffect, useRef } from 'react'
import HomeInput from './HomeInput'
import { ScrollArea } from '../ui/scroll-area'
import ChatSkeleton from './skeletons/ChatSkeleton'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'
import { AlertTriangle, CheckCheck, Copy, Forward, LoaderCircle, RotateCcw, TrashIcon } from 'lucide-react'
import {
  addOptimisticMessage,
  deleteOneMessage,
  deleteOneMessageReducer,
  fetchConversationMessages,
  markMessageFailed,
  selectActiveConversation,
  selectActiveConversationId,
  selectActiveConversationMessages,
  selectConversationBucketById,
  selectLegacyActiveChat,
} from '@/features/chat/chatSlice'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toast } from 'sonner'
import Linkify from 'linkify-react'
import { getSocket } from '@/services/socket/socket'
import { classifyMessageUrls } from '@/utils/messageRender'

const HomeChats = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const activeChat = useAppSelector(selectLegacyActiveChat)
  const activeConversationId = useAppSelector(selectActiveConversationId)
  const activeConversation = useAppSelector(selectActiveConversation)
  const chatMessages = useAppSelector(selectActiveConversationMessages)
  const bucket = useAppSelector(selectConversationBucketById(activeConversationId))
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const deliveredRef = useRef<Set<string>>(new Set())
  const readRef = useRef<Set<string>>(new Set())
  const prependSnapshotRef = useRef<{
    conversationId: string
    scrollTop: number
    scrollHeight: number
  } | null>(null)

  const getViewportElement = () => {
    return scrollAreaRef.current?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null
  }

  const options = {
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'text-green-600 underline',
  }

  const sendOptimisticMessage = (text: string) => {
    if (!text.trim() || !user?._id || !activeConversationId) return

    const socket = getSocket()
    const clientMsgId = crypto.randomUUID()

    dispatch(
      addOptimisticMessage({
        conversationId: activeConversationId,
        message: {
          clientMsgId,
          conversationId: activeConversationId,
          chatId: activeConversationId,
          sender: user._id,
          receiver: activeChat.participantId ?? activeChat._id,
          text: text.trim(),
          status: 'sent',
          localStatus: 'sending',
          ts: new Date().toISOString(),
          type: 'text',
        },
      })
    )

    if (!socket || !socket.connected) {
      dispatch(markMessageFailed({ clientMsgId, errorReason: 'Socket is not connected' }))
      return
    }

    socket.emit('message:send', {
      conversationId: activeConversationId,
      text: text.trim(),
      clientMsgId,
    })
  }

  useEffect(() => {
    if (!activeConversationId) return
    if (activeChat?.chat === 'direct' && activeChat?._id && activeConversationId === activeChat._id) return
    // Only auto-load once per conversation bucket to avoid retry loops on 404/empty responses.
    if (bucket) return

    dispatch(fetchConversationMessages({ conversationId: activeConversationId, mode: 'initial' }))
  }, [activeConversationId, activeChat?._id, activeChat?.chat, bucket, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    const snapshot = prependSnapshotRef.current
    if (!snapshot || !activeConversationId || !bucket) return
    if (snapshot.conversationId !== activeConversationId) return
    if (bucket.isFetchingOlder) return

    const viewport = getViewportElement()
    if (!viewport) return

    const heightDelta = viewport.scrollHeight - snapshot.scrollHeight
    viewport.scrollTop = snapshot.scrollTop + Math.max(heightDelta, 0)
    prependSnapshotRef.current = null
  }, [activeConversationId, bucket?.isFetchingOlder, chatMessages])

  useEffect(() => {
    const viewport = getViewportElement()
    if (!viewport || !activeConversationId) return

    const onScroll = () => {
      if (!bucket || bucket.isFetchingOlder || bucket.isInitialLoading || !bucket.hasMore || !bucket.nextCursor) {
        return
      }

      if (viewport.scrollTop > 56) {
        return
      }

      prependSnapshotRef.current = {
        conversationId: activeConversationId,
        scrollTop: viewport.scrollTop,
        scrollHeight: viewport.scrollHeight,
      }

      dispatch(
        fetchConversationMessages({
          conversationId: activeConversationId,
          cursor: bucket.nextCursor,
          mode: 'older',
        })
      )
    }

    viewport.addEventListener('scroll', onScroll)
    return () => viewport.removeEventListener('scroll', onScroll)
  }, [activeConversationId, bucket, dispatch])

  useEffect(() => {
    if (!activeConversationId || !user?._id) return

    const socket = getSocket()
    if (!socket || !socket.connected) return

    const incomingMessages = chatMessages.filter((message) => message.sender !== user._id)
    const latestIncoming = incomingMessages[incomingMessages.length - 1]
    const latestIncomingId = latestIncoming?._id ?? latestIncoming?.msgId ?? latestIncoming?.clientMsgId

    if (latestIncomingId && !deliveredRef.current.has(latestIncomingId)) {
      deliveredRef.current.add(latestIncomingId)
      socket.emit('message:delivered', {
        conversationId: activeConversationId,
        messageId: latestIncomingId,
      })
    }

    if (latestIncomingId && !readRef.current.has(latestIncomingId) && document.visibilityState === 'visible') {
      readRef.current.add(latestIncomingId)
      socket.emit('message:read', {
        conversationId: activeConversationId,
        readUptoMessageId: latestIncomingId,
      })
    }
  }, [activeConversationId, chatMessages, user?._id])

  const formatTime = (ts: string | Date) => {
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteOne = async (chatId: string, msgId: string) => {
    try {
      await dispatch(deleteOneMessage(msgId)).unwrap()
      dispatch(deleteOneMessageReducer({ chatId, msgId }))
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(String((error as { message?: string }).message), { position: 'top-right' })
      } else {
        toast.error('Something went wrong', { position: 'top-right' })
      }
    }
  }

  const handleCopy = (text: string) => {
    window.navigator.clipboard.writeText(text)
    toast.success('Message copied', { position: 'top-right' })
  }

  const handleRetryFailed = (text: string) => {
    sendOptimisticMessage(text)
    toast.success('Retrying message...', { position: 'top-right' })
  }

  return (
    <div className='flex min-h-0 grow flex-col bg-repeat bg-size-[320px] bg-[url("/chatBG-white.jpg")] dark:bg-[url("/chatBG-black.jpg")]'>
      <ScrollArea ref={scrollAreaRef} className='min-h-0 flex-1'>
        <div className='flex flex-col gap-3 p-4'>
          {bucket?.isFetchingOlder && (
            <div className='mx-auto flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground'>
              <LoaderCircle className='size-3 animate-spin' />
              Loading older messages...
            </div>
          )}

          {bucket?.isInitialLoading && Array.from({ length: 6 }, (_, index) => <ChatSkeleton key={index} value={index} />)}

          {!bucket?.isInitialLoading && chatMessages.map((message) => {
            const isMe = user._id === message.sender
            const messageKey = message._id ?? message.msgId ?? message.clientMsgId ?? `${message.sender}-${String(message.ts)}`
            const status = message.localStatus ?? message.status
            const { plainText, imageUrls, videoUrls, fileUrls } = classifyMessageUrls(message.text, message.type)

            return (
              <ContextMenu key={messageKey}>
                <ContextMenuTrigger className={`flex max-w-[70%] flex-col ${isMe ? 'self-end' : 'self-start'}`}>
                  <div>
                    <div
                      className={`rounded-b-lg px-2 py-1 text-white text-sm ${isMe ? 'bg-[#005c4b] rounded-l-lg' : 'bg-[#202c33] rounded-r-lg'}`}
                    >
                      {plainText && (
                        <div className='mr-5'>
                          <Linkify options={options}>{plainText}</Linkify>
                        </div>
                      )}

                      {imageUrls.length > 0 && (
                        <div className='mt-2 space-y-2'>
                          {imageUrls.map((url) => (
                            <a href={url} target='_blank' rel='noreferrer' key={url}>
                              <img
                                src={url}
                                alt='Uploaded media'
                                className='max-h-64 w-full rounded-lg object-cover'
                                loading='lazy'
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {videoUrls.length > 0 && (
                        <div className='mt-2 space-y-2'>
                          {videoUrls.map((url) => (
                            <video key={url} controls className='max-h-64 w-full rounded-lg'>
                              <source src={url} />
                            </video>
                          ))}
                        </div>
                      )}

                      {fileUrls.length > 0 && (
                        <div className='mt-2 space-y-2'>
                          {fileUrls.map((url) => (
                            <a
                              key={url}
                              href={url}
                              target='_blank'
                              rel='noreferrer'
                              className='block rounded-md bg-black/20 px-2 py-1 text-xs underline break-all'
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className='flex text-[11px] gap-0.5 text-muted-foreground justify-end items-center'>
                        {formatTime(message.ts)}
                        <div className={`${!isMe ? 'hidden' : 'flex'} items-center`}>
                          {status === 'sending' && <LoaderCircle className='size-4 animate-spin' />}
                          {status === 'failed' && (
                            <button
                              type='button'
                              className='inline-flex items-center gap-1 text-red-500 hover:text-red-400'
                              onClick={(event) => {
                                event.stopPropagation()
                                handleRetryFailed(message.text)
                              }}
                            >
                              <AlertTriangle className='size-4' />
                              <RotateCcw className='size-3' />
                            </button>
                          )}
                          {status === 'sent' && <CheckCheck className='size-4' />}
                          {status === 'delivered' && <CheckCheck className='size-4 text-muted-foreground' />}
                          {status === 'read' && <CheckCheck className='size-4 text-blue-500' />}
                        </div>
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
                    {status === 'failed' && (
                      <ContextMenuItem onClick={() => handleRetryFailed(message.text)}>
                        <RotateCcw />
                        Retry
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      onClick={() => handleDeleteOne(activeConversationId ?? activeChat._id, message._id ?? message.msgId ?? message.clientMsgId ?? '')}
                      variant='destructive'
                      disabled={!message._id && !message.msgId && !message.clientMsgId}
                    >
                      <TrashIcon />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}

          {!bucket?.isInitialLoading && chatMessages.length === 0 && activeConversationId && (
            <div className='py-10 text-center text-sm text-muted-foreground'>
              {activeConversation?.title ?? activeConversation?.name ?? 'Conversation'} is ready.
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <HomeInput />
    </div>
  )
}

export default HomeChats
