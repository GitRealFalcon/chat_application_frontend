import { useEffect, useState } from 'react'
import { RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from '@/components/ui/spinner'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/App/hooks'
import { generateCode, verification } from '@/features/auth/authSlice'
import { toast } from 'sonner'

const Verify = () => {
    const [value, setValue] = useState("")
    const [time, setTime] = useState("")
    const [expire, setExpire] = useState(false)
    const { email } = useParams()
    const navigate = useNavigate()
    const { verificationExpiry, loading } = useAppSelector(state => state.auth)
    const [isSubmittingOtp, setIsSubmittingOtp] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [otpMessage, setOtpMessage] = useState("")
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (value.length === 6) {
            setIsComplete(true)
        } else {
            setIsComplete(false)
        }
    }, [value])
    useEffect(() => {
        if (!verificationExpiry) {
            setExpire(true)
            setTime("0m:0s")
            return
        }

        const otpInterval = setInterval(() => {
            const expiryMs = new Date(verificationExpiry).getTime()
            const remainingMs = expiryMs - Date.now()

            if (Number.isNaN(expiryMs)) {
                setExpire(true)
                setTime("0m:0s")
                clearInterval(otpInterval)
                return
            }
            

            if (remainingMs <= 0) {
                setExpire(true);
                setTime("0m:0s");
                clearInterval(otpInterval);
                return;
            }

            const minutes = Math.floor(remainingMs / (60 * 1000));
            const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

            setTime(`${minutes}m:${seconds}s`);
        }, 1000);

        return () => clearInterval(otpInterval); // cleanup
    }, [verificationExpiry]);

    const handleResendCode = async () => {
        const toastId = toast.loading("Please wait...", {
            position: "top-right"
        })
        try {
            await dispatch(generateCode(email)).unwrap()
            setExpire(false)
            setOtpMessage("New Verification code send your email")
            toast("Success", {
                description: "New OTP send Your Emil",
                position: "top-right"
            })
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error
            ) {
                toast.error(String((error as any).message), { position: "top-right" })
                setOtpMessage(String((error as any).message))
            } else {
                toast.error("Something went wrong", { position: "top-right" })
                 setOtpMessage("Something went wrong")
            }
        } finally {
            toast.dismiss(toastId)
        }
    }

    const handleSubmit = async () => {
        const toastId = toast.loading("Please Wait...", {
            position: "top-right"
        })
        try {
            setIsSubmittingOtp(true)
            const response = await dispatch(verification({ email, code: value })).unwrap()
            setOtpMessage(response.message)
            toast.success(response.message, {
                position: "top-right"
            })
            navigate("/login")
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error
            ) {
                toast.error(String((error as any).message), { position: "top-right" })
                setOtpMessage(String((error as any).message))
            } else {
                toast.error("Something went wrong", { position: "top-right" })
                setOtpMessage("Something went wrong")
            }
        } finally {
            toast.dismiss(toastId)
            setIsSubmittingOtp(false)
        }
    }

    const handleOtpChange = (code: string) => {
        setValue(code)
    }

    return (
        <div className='w-full h-screen flex items-center justify-center'>
            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Verify your login</CardTitle>
                    <CardDescription>
                        Enter the verification code we sent to your email address:{" "}
                        <span className="font-medium">{email}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="otp-verification">
                                Verification code
                            </FieldLabel>
                            <Button onClick={handleResendCode} disabled={loading || !expire} variant="outline" size="xs">
                               {expire? <><RefreshCwIcon /> Resend Code </> : <div>{time}</div>} 
                            </Button>
                        </div>
                        <InputOTP value={value} onChange={handleOtpChange} maxLength={6} id="otp-verification" required>
                            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator className="mx-2" />
                            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        {otpMessage && <p className={`${otpMessage === "Account verified successfully" || otpMessage === "New Verification code send your email" ? "text-green-500" : "text-red-500"}`}>{otpMessage}</p>}
                        <FieldDescription>
                            <Link to="/register">I no longer have access to this email address.</Link>
                        </FieldDescription>
                    </Field>
                </CardContent>
                <CardFooter>
                    <Field>
                        <Button onClick={handleSubmit} disabled={!isComplete || isSubmittingOtp} className="w-full">
                            {isSubmittingOtp ? <><Spinner /> Please Wait...</> : "Verify"}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Having trouble signing in?{" "}
                            <Link
                                to="#"
                                className="underline underline-offset-4 transition-colors hover:text-primary"
                            >
                                Contact support
                            </Link>
                        </div>
                    </Field>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Verify
