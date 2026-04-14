import * as z from "zod"
export const OnlineSchema = z.object({
    userId: z.string(),
    status: z.enum(["online", "offline"])
})