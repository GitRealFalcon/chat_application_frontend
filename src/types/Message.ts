
export type Message = {
    _id?:string,
    msgId?: string,
    sender: string,
    receiver?: string,
    text: string,
    status?: "sent" | "delivered" | "read",
    ts: Date,
    group?: string,
    deliveredTo?: string[],
    readBy?: string[]
}