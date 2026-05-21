import React, { useRef, useState } from 'react'
import { Plus, SendHorizonal } from 'lucide-react'
import { Button } from '../ui/button'
import { getSocket } from '@/services/socket/socket'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import {
  addOptimisticMessage,
  fetchConversationMessages,
  markMessageFailed,
  selectActiveConversationId,
  selectLegacyActiveChat,
  setActiveChat,
  setActiveConversationId,
} from '@/features/chat/chatSlice'
import { selectAuthUser } from '@/features/auth/authSlice'
import { toast } from 'sonner'
import { createOrGetDirectConversationAPI, uploadMultipleMediaAPI, uploadSingleMediaAPI } from '@/features/chat/chatAPI'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_FILES = 5
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'video/',
  'text/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

const HomeInput = () => {
  const [text, setText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const activeChat = useAppSelector(selectLegacyActiveChat)
  const activeConversationId = useAppSelector(selectActiveConversationId)
  const user = useAppSelector(selectAuthUser)
  const timeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dispatch = useAppDispatch()

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

  const resolveDirectConversationIfNeeded = async (): Promise<string | null> => {
    if (!user || !activeChat?._id || !activeConversationId) {
      return null
    }

    const participantId = activeChat.participantId
    const needsResolution =
      activeChat.chat === 'direct' &&
      typeof participantId === 'string' &&
      participantId.length > 0 &&
      activeConversationId === participantId

    if (!needsResolution) {
      return activeConversationId
    }

    try {
      const res = await createOrGetDirectConversationAPI(participantId)
      const conversationId = extractConversationIdFromDirectResponse(res)
      if (!conversationId) {
        return null
      }

      dispatch(
        setActiveChat({
          ...activeChat,
          _id: conversationId,
          participantId,
        })
      )
      dispatch(setActiveConversationId(conversationId))
      dispatch(fetchConversationMessages({ conversationId, mode: 'initial' }))
      return conversationId
    } catch {
      return null
    }
  }

  const isAllowedMimeType = (mimeType: string) => {
    return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
  }

  const extractUploadedUrls = (payload: unknown): string[] => {
    const urls: string[] = []

    const walk = (value: unknown) => {
      if (!value) return

      if (Array.isArray(value)) {
        value.forEach(walk)
        return
      }

      if (typeof value === 'object') {
        const record = value as Record<string, unknown>

        if (typeof record.url === 'string') urls.push(record.url)
        if (typeof record.fileUrl === 'string') urls.push(record.fileUrl)
        if (typeof record.secure_url === 'string') urls.push(record.secure_url)
        if (typeof record.location === 'string') urls.push(record.location)

        Object.values(record).forEach(walk)
      }
    }

    walk(payload)

    return Array.from(new Set(urls))
  }

  const getMessageTypeFromFiles = (files: File[]) => {
    if (files.length === 0) return 'text' as const

    const allImages = files.every((file) => file.type.startsWith('image/'))
    if (allImages) return 'image' as const

    const allVideos = files.every((file) => file.type.startsWith('video/'))
    if (allVideos) return 'video' as const

    return 'document' as const
  }

  const emitMessage = async (
    messageText: string,
    messageType: 'text' | 'image' | 'video' | 'document' = 'text'
  ) => {
    if (!user || !activeConversationId || !messageText.trim()) return

    const resolvedConversationId = await resolveDirectConversationIfNeeded()
    if (!resolvedConversationId) {
      toast.error('Unable to create conversation. Please try again.', { position: 'top-right' })
      return
    }

    const socket = getSocket()
    const clientMsgId = crypto.randomUUID()
    const optimisticMessage = {
      clientMsgId,
      conversationId: resolvedConversationId,
      chatId: resolvedConversationId,
      sender: user._id,
      receiver: activeChat.participantId ?? activeChat._id,
      text: messageText.trim(),
      status: 'sent' as const,
      localStatus: 'sending' as const,
      ts: new Date().toISOString(),
      type: messageType,
    }

    dispatch(
      addOptimisticMessage({
        conversationId: resolvedConversationId,
        message: optimisticMessage,
      })
    )

    if (!socket || !socket.connected) {
      dispatch(markMessageFailed({ clientMsgId, errorReason: 'Socket is not connected' }))
      return
    }

    socket.emit('message:send', {
      conversationId: resolvedConversationId,
      text: messageText.trim(),
      clientMsgId,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value
    setText(nextText)

    const socket = getSocket()
    if (!activeConversationId || !user || !socket) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing:start', {
        userId: user._id,
        chatId: activeConversationId,
        chatType: activeChat.chat ?? 'direct',
      })
    }

    if (timeOutRef.current) clearTimeout(timeOutRef.current)

    timeOutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('typing:stop', {
        userId: user._id,
        chatId: activeConversationId,
        chatType: activeChat.chat ?? 'direct',
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!text.trim() || !user || !activeConversationId) return

    await emitMessage(text)

    setText('')
  }

  const handlePickFiles = () => {
    if (!activeConversationId || isUploading) return
    fileInputRef.current?.click()
  }

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? [])
    e.target.value = ''

    if (!activeConversationId || !user || selectedFiles.length === 0) return

    if (selectedFiles.length > MAX_FILES) {
      toast.error(`You can upload at most ${MAX_FILES} files at once.`, { position: 'top-right' })
      return
    }

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 50MB limit.`, { position: 'top-right' })
        return
      }

      if (!isAllowedMimeType(file.type)) {
        toast.error(`${file.name} is not a supported file type.`, { position: 'top-right' })
        return
      }
    }

    try {
      setIsUploading(true)

      const res =
        selectedFiles.length === 1
          ? await uploadSingleMediaAPI(selectedFiles[0])
          : await uploadMultipleMediaAPI(selectedFiles)

      const urls = extractUploadedUrls(res.data)

      if (urls.length === 0) {
        toast.error('Upload finished but no file URL was returned by the server.', { position: 'top-right' })
        return
      }

      const baseText = text.trim()
      const composedText = baseText ? `${baseText}\n${urls.join('\n')}` : urls.join('\n')
      const mediaType = getMessageTypeFromFiles(selectedFiles)

      await emitMessage(composedText, mediaType)
      setText('')
      toast.success('Media uploaded and sent.', { position: 'top-right' })
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        toast.error(String((error as { message?: string }).message), { position: 'top-right' })
      } else {
        toast.error('Failed to upload media.', { position: 'top-right' })
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className='w-full p-4'>
      <form onSubmit={handleSubmit} className='flex border-2 rounded-4xl transition-colors bg-muted p-1 items-center'>
        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          multiple
          onChange={handleFilesSelected}
        />
        <button
          type='button'
          onClick={handlePickFiles}
          disabled={!activeConversationId || isUploading}
          className='rounded-full flex items-center hover:bg-muted h-10 w-10 disabled:opacity-60'
        >
          <Plus className='mx-auto' />
        </button>
        <input
          disabled={!activeConversationId || isUploading}
          value={text}
          onChange={handleChange}
          type='text'
          className='grow outline-none px-3 placeholder:text-muted-foreground placeholder:font-semibold text-foreground'
          placeholder={isUploading ? 'Uploading media...' : 'Type a message'}
        />
        <Button disabled={!activeConversationId || isUploading} type='submit' className='bg-green-700 rounded-full flex items-center h-10 w-10'>
          <SendHorizonal className='mx-auto text-black fill-black' />
        </Button>
      </form>
    </div>
  )
}

export default HomeInput
