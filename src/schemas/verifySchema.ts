import * as z from "zod"
export const verifySchema = z.string().min(6,"Min OTP length 6")