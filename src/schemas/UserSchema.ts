import * as z from "zod"
import { GroupSchema } from "./GroupSchema"
import { User } from "@/types/User"

export const UserSchema: z.ZodType<User> = z.object({
    _id: z.string().optional(),
    name: z.string().min(2).max(20),
    email: z.string().email(),
    block: z.array(z.string()).optional(),
    chats: z.array(z.lazy(() => UserSchema)).optional(),
    joinedGroup: z.array(z.lazy(() => GroupSchema)).optional()
})