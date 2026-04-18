import * as z from "zod"

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character")

export const singUpSchema = z.object({
    name: z.string()
    .min(2, "username must be at least 2 characters")
    .max(20, "username must be no more then 20 characters"),
    email : z.email({ error: "Invalid email address" }),
    password: passwordSchema
})