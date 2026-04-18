import { Group } from "./Group"

export type User = {
    _id?: string
    name: string,
    email: string,
    isVerified?: boolean,
    Chats?: User[],
    JoinedGroups?: Group[],
    Blocked?: User[],
    avatar?: string,
    ChatRequests?: User[]
}