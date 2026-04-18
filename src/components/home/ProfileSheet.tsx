import { useAppSelector } from "@/App/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {  BadgeAlert, BadgeCheck, User2 } from "lucide-react"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Link } from "react-router-dom"


type ProfileSheetProps = {
  trigger?: ReactNode
}

export function ProfileSheet({ trigger }: ProfileSheetProps) {
  const user = useAppSelector(state=> state.auth.user)
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="flex items-center gap-2 text-sm"
          >
            <User2 size={14} />
            Profile
          </button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User profile</SheetTitle>
          <SheetDescription>
            {!user.isVerified? <Link to={`/verify/${user.email}`}><div className="bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20 rounded-2xl p-2">Your account hasn’t been verified yet. Please click here to verify your email.</div></Link> : "Make changes to your profile here. Click save when you&apos;re done."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <Avatar className="size-32 shrink-0 rounded-full">
            <AvatarImage
              src={user?.avatar} alt="@shadcn"
              className="h-full w-full object-cover"
            />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
          {user?.isVerified ? <Badge variant="secondary">
        <BadgeCheck data-icon="inline-start" />
        Verified
      </Badge>: <Badge variant="destructive">
        <BadgeAlert data-icon="inline-start" />
        Unverified
      </Badge>}
          <div className="text-center font-semibold text-2xl">
            {user.name}
          </div>
          <div className="text-center font-semibold">
            {user.email}
          </div>
        </div>
        <Separator/>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
