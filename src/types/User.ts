import { Group } from "./Group"

export type User = {
    _id?: string
    name: string,
    email: string,
    Chats?: User[],
    JoinedGroups?: Group[],
    Blocked?: string[],
    avatar?: string,
    ChatRequests?: User[]
}