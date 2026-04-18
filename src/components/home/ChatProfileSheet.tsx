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
import { BadgeAlert, BadgeCheck, Ban, Bell, Filter, RefreshCcwIcon, Trash2, User2, UserPlus2, UserPlus2Icon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppDispatch, useAppSelector } from "@/App/hooks"
import { Separator } from "../ui/separator"
import { User } from "@/types/User"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"
import { blockUser } from "@/features/user/userSlice"
import { toast } from "sonner"
import { getUser } from "@/features/auth/authSlice"
import { clearActiveChat, deleteAllMessage, deleteAllMessageReducer } from "@/features/chat/chatSlice"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Badge } from "../ui/badge"

type ProfileSheetProps = {
  trigger?: ReactNode
}



export function ChatProfileSheet({ trigger }: ProfileSheetProps) {
  const [contact, setContact] = useState<User>()
  const { activeChat } = useAppSelector(state => state.chat)
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (activeChat) {
      const activeUser = user?.Chats.find(contact => contact._id === activeChat._id)
      setContact(activeUser)
    }
  }, [activeChat])

  const handleBlock = async (chatId: string) => {
    try {
      const res = await dispatch(blockUser(chatId)).unwrap()
      dispatch(clearActiveChat())
      dispatch(getUser())
      toast.success(`${activeChat.title} blocked ✅`, { position: "top-right" })
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        toast.error(String((error as any).message),{position: "top-right"})
      } else {
        toast.error("Something went wrong",{position: "top-right"})
      }
    }
  }

  const handleDeleteAll = async (chatId: string)=>{
    try {
      await dispatch(deleteAllMessage(chatId)).unwrap()
      dispatch(deleteAllMessageReducer(chatId))
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        toast.error(String((error as any).message),{position: "top-right"})
      } else {
        toast.error("Something went wrong",{position: "top-right"})
      }
    }
  }

  const empty = (<Empty className="h-full bg-muted/30">
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
  </Empty>)

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
          {contact?.isVerified ? <Badge variant="secondary">
        <BadgeCheck data-icon="inline-start" />
        Verified
      </Badge>: <Badge variant="destructive">
        <BadgeAlert data-icon="inline-start" />
        Unverified
      </Badge>}
          <div className="text-center font-semibold text-2xl">
            {activeChat?.title}
          </div>
          <div className="text-center font-semibold">
            {contact && contact.email}
          </div>
        </div>
          <Separator />
          <div className="flex flex-col gap-2 w-full">
            {/* Block */}

            <AlertDialog >
              <AlertDialogTrigger asChild>
                <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
                  <Ban size={16} />
                  <span className="font-bold">Block</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Ban />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Block {activeChat.title}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will block the selected user.
                    They will no longer be able to send you messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel  >Close</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBlock(activeChat._id)} variant="destructive">Block Chat</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete */}
            <AlertDialog >
              <AlertDialogTrigger asChild>
                <div className="flex gap-4 items-center text-red-400 hover:bg-muted w-full p-4 rounded-2xl">
                  <Trash2 size={16} />
                  <span className="font-bold">Delete Chat</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash2 />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete {activeChat.title}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently remove the selected chat.
                    You won’t be able to restore the deleted conversation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel >Close</AlertDialogCancel>
                  <AlertDialogAction onClick={()=> handleDeleteAll(activeChat._id)} variant="destructive">Delete Chat</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div></>) : empty}

        <SheetFooter>

          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
