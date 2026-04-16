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
import { Ban, Bell, Filter, RefreshCcwIcon, Trash2, User2, UserPlus2 } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppSelector } from "@/App/hooks"
import { Separator } from "../ui/separator"
import { User } from "@/types/User"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"

type ProfileSheetProps = {
  trigger?: ReactNode
}

export function ChatProfileSheet({ trigger }: ProfileSheetProps) {
  const [contact, setContact] = useState<User>()
  const { activeChat } = useAppSelector(state => state.chat)
  const user = useAppSelector(state => state.auth.user)
  console.log(activeChat);
  
  useEffect(() => {
    if (activeChat) {
      const activeUser = user?.Chats.find(contact => contact._id === activeChat._id)
      setContact(activeUser)
    }
  }, [activeChat])

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
      <SheetContent className="px-2">
        <SheetHeader>
          <SheetTitle>Contact Info</SheetTitle>
        </SheetHeader>
        {activeChat._id ? (<><div className="flex flex-col items-center gap-2 px-4">
          <Avatar className="size-32 shrink-0 rounded-full">
            <AvatarImage
              src={activeChat?.avatar} alt="@shadcn"
              className="h-full w-full object-cover"
            />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
          <div className="text-center font-semibold text-2xl">
            {activeChat?.title}
          </div>
          <div className="text-center font-semibold">
            {contact && contact.email}
          </div>
        </div>
          <Separator />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
              <Ban size={16} />
              <span className="font-bold">Block</span>
            </div>
            <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
              <Trash2 size={16} />
              <span className="font-bold">Delete Chat</span>
            </div>
          </div></>) : <Empty className="h-full bg-muted/30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserPlus2 />
            </EmptyMedia>
            <EmptyTitle>No Active Chat</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              You&apos;re all caught up. Select Chat will appear here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline">
              <RefreshCcwIcon />
              Refresh
            </Button>
          </EmptyContent>
        </Empty>}

        <SheetFooter>

          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
