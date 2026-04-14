import { ActiveChat } from "@/features/chat/chatSlice";
import { Group } from "@/types/Group";
import { Typing } from "@/types/Typing";

export const directTyping = (typing: Typing[], chatId: string): string => {
    const filteredDirectTyping = typing.filter(type => type.chatType === "direct")
    if (filteredDirectTyping.length > 0) {
        const isTyping = filteredDirectTyping.some(type => type.userId === chatId)
        if (isTyping) {
            return "Typing..."
        }
        return ""
    }

    return "";
}

export const groupTyping = (typing: Typing[], group: Group): string => {
    const filteredGroupTyping = typing.filter(type => type.chatType === "group")
    if (filteredGroupTyping.length > 0) {
        const typingMembers = group.memberDetails.filter(member => typing.some(type => type.userId === member._id))
        if (typingMembers.length > 0) {
            if (typingMembers.length > 2) {
                return `${typingMembers[0].name}, ${typingMembers[1].name} is typing...`
            }
            return `${typingMembers[0].name} is typing...`

        }
        return ""
    }
    return ""
}