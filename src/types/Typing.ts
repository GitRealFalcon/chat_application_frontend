export type Typing ={
    type: "typing:start" | "typing:stop",
    userId: string,
    chatId: string,
    chatType: "direct" | "group"
}