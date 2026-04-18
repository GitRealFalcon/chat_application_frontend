import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../App/hooks'
import { registerUser } from '../features/auth/authSlice'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription
} from "@/components/ui/card"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldContent

} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { singUpSchema } from '@/schemas/singUpSchema'
import { toast } from 'sonner'

const Register = () => {
  const { loading, error, message } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof singUpSchema>>({
    resolver: zodResolver(singUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  })




  const onSubmit = async (data: z.infer<typeof singUpSchema>) => {
    const toastId = toast.loading("Please wait...", {
      position: "top-right"
    })
    try {
      const response = await dispatch(registerUser(data)).unwrap()

      navigate(`/verify/${data.email}`)

      form.reset({
        name: "",
        email: "",
        password: ""
      })
      
      toast("Success", {
        description: "User Register Please Verify Your Email",
        position: "top-right"
      })

      
    }
    catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        toast.error(String((error as any).message), { position: "top-right" })
      } else {
        toast.error("Something went wrong", { position: "top-right" })
      }
    } finally {
      toast.dismiss(toastId)
    }

  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 text-foreground md:p-10">
      <div className="w-full max-w-sm">

        <Card className="w-full sm:max-w-md">
          <CardHeader className="flex-col items-center justify-center">
            <CardTitle className="text-center">
              <img className='size-12 mx-auto' src="/chat-round.svg" alt="logo" />
              Join Chattify Messaging
            </CardTitle>
            <CardDescription>
              Sign up to start your anonymous adventure
            </CardDescription>
            <p className=" text-muted-foreground mx-auto">Already have an account? <Link to={"/login"} className="font-bold">Sign in</Link></p>
          </CardHeader>

          <CardContent>
            <form id="sign-up" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field  >
                      <FieldLabel htmlFor="name">
                        Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Name"
                        autoComplete="off"

                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}

                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field  >
                      <FieldLabel htmlFor="email">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Email Address"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field  >
                      <FieldLabel htmlFor="password">
                        Password
                      </FieldLabel>
                      <Input
                        type="password"
                        {...field}
                        id="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Password"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

            </form>
          </CardContent>

          <CardFooter>
            <Field orientation={"horizontal"}>
              <Button type="submit" form="sign-up" disabled={loading}>
                {loading ? <> <Spinner /> Please Wait...</> : (" Sign Up")}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Register
