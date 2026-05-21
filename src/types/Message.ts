
export type Message = {
    _id?: string,
    msgId?: string,
    clientMsgId?: string,
    conversationId?: string,
    chatId: string,
    sender: string,
    receiver?: string,
    text: string,
    status?: "sent" | "delivered" | "read",
    localStatus?: "sending" | "sent" | "delivered" | "read" | "failed",
    errorReason?: string,
    ts: string | number | Date,
    type: "sending" | "text" | "image" | "video" | "document",
    fileUrl?: String,
    fileName?: String,
    fileSize?: Number,
    mimeType?: String,
    thumbnail?: String,
    group?: string,
    deliveredTo?: string[],
    readBy?: string[]
}