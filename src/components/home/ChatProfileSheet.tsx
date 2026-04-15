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
import { Ban, Filter, Trash2, User2 } from "lucide-react"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppSelector } from "@/App/hooks"
import { Separator } from "../ui/separator"

type ProfileSheetProps = {
  trigger?: ReactNode
}

export function ChatProfileSheet({ trigger }: ProfileSheetProps) {
  const { activeChat } = useAppSelector(state => state.chat)
  const user = useAppSelector(state=> state.auth.user)
  const contact = user?.Chats.find(contact => contact._id === activeChat._id)
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
        <div className="flex flex-col items-center gap-2 px-4">
          <Avatar className="size-32 shrink-0 rounded-full">
            <AvatarImage
              src={activeChat.avatar} alt="@shadcn"
              className="h-full w-full object-cover"
            />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
          <div className="text-center font-semibold text-2xl">
            {activeChat.title}
          </div>
          <div className="text-center font-semibold">
            {contact.email}
          </div>
        </div>
        <Separator/>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
            <Ban size={16} />
            <span className="font-bold">Block</span>
          </div>
          <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
            <Trash2 size={16} />
            <span className="font-bold">Delete Chat</span>
          </div>
        </div>
        <SheetFooter>

          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
