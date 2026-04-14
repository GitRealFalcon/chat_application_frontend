import z from "zod";

export const TypingSchema = z.object({
    userId: z.string(),
    chatId: z.string()
})