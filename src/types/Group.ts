import { User } from "./User"

export type Group = {
    _id?: string,
    name: string,
    memberDetails: User[],
    adminDetails: User[]
}