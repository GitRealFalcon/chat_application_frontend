import { Message } from "@/types/Message";
import * as z from "zod";


export const MessageSchema: z.ZodType<Message> = z.object({
        _id: z.string().optional(),
        sender: z.string(),
        receiver: z.string().optional(),
        text: z.string(),
        status: z.enum(["sent", "delivered", "read"]).optional(),
        ts: z.date(),
        group: z.string().optional(),
        deliveredTo: z.array(z.string()).optional(),
        readBy: z.array(z.string()).optional()
        
})

