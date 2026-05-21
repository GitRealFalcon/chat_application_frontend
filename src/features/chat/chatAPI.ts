
import { ApiResponse } from "@/types/ApiResponse"
import axiosInstance from "../../services/API/axiosInstans"

export type CursorQuery = {
    cursor?: string
    limit?: number
}

export type MessageStatusPayload = {
    status: "delivered" | "read"
    conversationId: string
    messageId?: string
    readUptoMessageId?: string
}

export const createOrGetDirectConversationAPI = async (participantId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.post(`/conversation/direct`, { participantId })
    return res.data
}

export const listConversationsAPI = async ({ cursor, limit = 20 }: CursorQuery = {}): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/conversation`, {
        params: {
            ...(cursor ? { cursor } : {}),
            limit,
        },
    })
    return res.data
}

export const getConversationMessagesAPI = async (
    conversationId: string,
    { cursor, limit = 30 }: CursorQuery = {}
): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/conversation/${conversationId}/messages`, {
        params: {
            ...(cursor ? { cursor } : {}),
            limit,
        },
    })
    return res.data
}

export const patchMessageStatusAPI = async (payload: MessageStatusPayload): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/message/status`, payload)
    return res.data
}

export const uploadSingleMediaAPI = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await axiosInstance.post(`/media/single`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return res.data
}

export const uploadMultipleMediaAPI = async (files: File[]): Promise<ApiResponse> => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    const res = await axiosInstance.post(`/media/multiple`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return res.data
}

// Legacy endpoints kept temporarily for in-progress UI migration.
export const messageAPI = async (peerId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/message/direct/${peerId}`)
    return res.data
}

export const groupMessageAPI = async (groupId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/message/group/${groupId}`)
    return res.data
}

export const updateMessageStatusAPI = async (peerId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/message/update/${peerId}`)
    return res.data
}

export const deleteOneMessageAPI = async (msgId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.delete(`/message/one/${msgId}`)
    return res.data
}

export const deleteAllMessageAPI = async (chatId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.delete(`/message/all/${chatId}`)
    return res.data
}

