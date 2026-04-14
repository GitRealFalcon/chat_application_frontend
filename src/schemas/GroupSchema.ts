import * as z from "zod"
import { UserSchema } from "./UserSchema"
export const GroupSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(2).max(20),
    members: z.array(z.lazy(() => UserSchema)),
    admins: z.array(z.lazy(() => UserSchema)),
})

