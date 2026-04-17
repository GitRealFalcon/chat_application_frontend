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
import { MessageSquareLock, RefreshCcwIcon, User2, UserCheck2Icon, UserPlus2, UserPlus2Icon } from "lucide-react"
import type { ReactNode } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppDispatch, useAppSelector } from "@/App/hooks"
import { unBlockUser } from "@/features/user/userSlice"
import { getUser } from "@/features/auth/authSlice"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"

type ProfileSheetProps = {
  trigger?: ReactNode
}

const BlockSheet = ({ trigger }: ProfileSheetProps) => {
  const { Blocked } = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()

  const handleUnblock = async (chatId: string, name: string) => {
    try {
      await dispatch(unBlockUser(chatId)).unwrap()
      dispatch(getUser())
      toast.success(`${name} unBlocked`, { position: "top-right" })
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
                  <EmptyTitle>No Block Chat</EmptyTitle>
                  <EmptyDescription className="max-w-xs text-pretty">
                    You&apos;re all caught up. Block Chat will appear here.
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Blocked User</SheetTitle>

        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 h-3/4">
          <ScrollArea className="grow ">
            {Blocked.length > 0 ? Blocked.map((item) => {
              const card = (
                <div key={item._id} className={` flex justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl`}>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={item?.avatar}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback>
                        {item.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <Button variant="destructive" size="icon"><MessageSquareLock /></Button>
                </div>);
             
              return (
                <AlertDialog key={item._id}>
                  <AlertDialogTrigger asChild>
                    {card}
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia >
                        <MessageSquareLock />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Blocked User {item.name}</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will unblock the selected chat and allow the user to send messages again.
                        Blocked users will be able to continue the conversation normally.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel  >Close</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUnblock(item._id, item.name)} >unBlock</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            }): empty}

          </ScrollArea>
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

export default BlockSheet
