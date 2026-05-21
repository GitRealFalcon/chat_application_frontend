import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../App/hooks'
import { loginUser } from '../features/auth/authSlice'
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

} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from 'sonner'
import { signInSchema } from '@/schemas/signInSchema'
const Login = () => {
  const [signInMessage, setSignInMessage] = useState("")
  const dispatch = useAppDispatch()
  const { loading, isAuthenticated} = useAppSelector(state => state.auth)
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  if (isAuthenticated) {
    navigate("/")
  }

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const toastId = toast.loading("Please wait...", {
      position: "top-right"
    })
    try {
      const res = await dispatch(loginUser(data)).unwrap()
      form.reset({
        email: "",
        password: ""
      })
      navigate("/")
      toast("Success", {
        description: "Sign in successful",
        position: "top-right"
      })

    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        toast.error(String((error as any).message), { position: "top-right" })
        setSignInMessage(String((error as any).message))
      } else {
        toast.error("Something went wrong", { position: "top-right" })
        setSignInMessage("Something went wrong")
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
            <CardTitle className="text-center ">
              <img className='size-12 mx-auto' src="/chat-round.svg" alt="logo" />
              <> Chattify Message</>
            </CardTitle>
            <CardDescription>
              Sign In to start your anonymous adventure
            </CardDescription>
            <p className=" text-muted-foreground mx-auto">Don't have an account? <Link to={"/register"} className="font-bold">Sign Up</Link></p>
          </CardHeader>

          <CardContent>
            <form id="sign-in" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
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
                        id="identifier"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Email"
                        autoComplete="off"

                      />
                      {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
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
              {signInMessage && (
                <p className="text-sm text-red-500">{signInMessage}</p>
              )}

            </form>
          </CardContent>

          <CardFooter>
            <Field orientation={"horizontal"}>
              <Button type="submit" form="sign-in" disabled={loading}>
                {loading ? <> <Spinner /> Please Wait...</> : (" Sign In")}

              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
