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
import { Trash2Icon, User2, UserPlus2Icon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppDispatch, useAppSelector } from "@/App/hooks"
import { acceptFriendRequest, cancelFriendRequest, FriendRequest, getFriendRequests, rejectFriendRequest } from "@/features/friendRequest/friendRequestSlice"
import { toast } from "sonner"
import { Separator } from "../ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { getUser } from "@/features/auth/authSlice"


type ProfileSheetProps = {
  trigger?: ReactNode
}

const ChatRequestSheet = ({ trigger }: ProfileSheetProps) => {
  const [incomingRequest, setIncomingRequest] = useState<FriendRequest[]>([])
  const [sentRequest, setSentRequest] = useState<FriendRequest[]>([])
  const user = useAppSelector(state => state.auth.user)
  const { friendRequests, loading } = useAppSelector(state => state.friendRequest)
  const dispatch = useAppDispatch()
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await dispatch(getFriendRequests()).unwrap()
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
    fetchRequests()
  }, [dispatch])

  useEffect(() => {
    const filterRequests = (requests: FriendRequest[]) => {
      if (requests) {
        const incoming = requests.filter((request) => request.requestReceiver._id === user._id)
        const sent = requests.filter((request) => request.requestSender._id === user._id)
        if (incoming) {
          setIncomingRequest(incoming)
        }

        if (sent) {
          setSentRequest(sent)
        }
      }
    }

    filterRequests(friendRequests)
  }, [friendRequests])

  const handleAcceptRequest = async (reqId: string) => {
    try {
      const res = await dispatch(acceptFriendRequest(reqId)).unwrap()
      dispatch(getFriendRequests())
      dispatch(getUser())
      toast.success(res, { position: "top-right" })
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

  const handleRejectRequest = async (reqId: string) => {
    try {
      const res = await dispatch(rejectFriendRequest(reqId)).unwrap()
      dispatch(getFriendRequests())
      toast.success(res, { position: "top-right" })
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

  const handleCancelRequest = async (reqId: string) => {
    try {
      const res = await dispatch(cancelFriendRequest(reqId)).unwrap()
      dispatch(getFriendRequests())
      toast.success(res, { position: "top-right" })
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
          <SheetTitle>Chat Request</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 h-3/4">
          <ScrollArea className="grow ">
            <div>Incoming Friend Requests</div>
            {incomingRequest && incomingRequest.map((item) => {
              const date = new Date(item.createdAt).toLocaleDateString()
              const card = (<div key={item._id} className={`flex justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl`}>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={item?.requestSender.avatar}
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback>
                      {item.requestSender.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{item.requestSender.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className={`capitalize ${item.status === "pending" ? "text-green-400" : item.status === "rejected" ? "text-red-400" : "text-muted-foreground"}`}>{item.status}</div>
                  <div className="text-xs text-muted-foreground">{date}</div>
                </div>
              </div>)
              return (
                item.status === "pending" ? <AlertDialog key={item._id}>
                  <AlertDialogTrigger asChild>
                    {card}
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia >
                        <UserPlus2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Request {item.requestSender.name}</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will accept or reject the selected friend request.
                        Rejected requests must be sent again by the user.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => handleRejectRequest(item._id)} >Reject</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleAcceptRequest(item._id)} >Accept</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog> : card

              )
            })}
          </ScrollArea>
          {/* sent friend request */}
          <Separator />
          <ScrollArea className="grow ">
            <div>Sent Friend Requests</div>
            {sentRequest && sentRequest.map((item) => {
              const date = new Date(item.createdAt).toLocaleDateString()
              const card = (<div key={item._id} className={`flex justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl`}>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={item?.requestReceiver.avatar}
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback>
                      {item.requestReceiver.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{item.requestReceiver.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className={`capitalize ${item.status === "pending" ? "text-green-400" : item.status === "rejected" ? "text-red-400" : "text-muted-foreground"}`}>{item.status}</div>
                  <div className="text-xs text-muted-foreground">{date}</div>
                </div>
              </div>)
              return (

                item.status === "pending" ? <AlertDialog key={item._id}>
                  <AlertDialogTrigger asChild>
                    {card}
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Cancel Friend Request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently cancel this friend request.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">Close</AlertDialogCancel>
                      <AlertDialogAction onClick={()=> handleCancelRequest(item._id)} disabled={item.status !== "pending"} variant="destructive">Cancel Request</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog> : card
              )
            })}
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

export default ChatRequestSheet
