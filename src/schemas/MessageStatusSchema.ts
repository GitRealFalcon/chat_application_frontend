import * as z from "zod";

export const MessageStatusSchema = z.enum(["sent", "delivered", "read"])