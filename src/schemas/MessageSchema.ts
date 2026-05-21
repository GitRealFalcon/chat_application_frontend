import { Message } from "@/types/Message";
import * as z from "zod";


export const MessageSchema = z.object({
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

// Compile-time guard to keep schema aligned with Message type.
type _MessageSchemaMatchesMessage = z.infer<typeof MessageSchema> extends Message ? true : never;

