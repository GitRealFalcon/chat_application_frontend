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
import { Search, UserCheck2, UserPlus2, Verified } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppDispatch, useAppSelector } from "@/App/hooks"
import { useEffect, useRef, useState } from "react"
import { User } from "@/types/User"
import { setSearchUser, searchUser, resetSearchUser, } from "@/features/user/userSlice"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"
import { FriendRequest, getFriendRequests, sendFriendRequest } from "@/features/friendRequest/friendRequestSlice"



type History = {
    [id: string]: User[]
}
export function SearchSheet() {
    const [text, setText] = useState("")
    const [history, setHistory] = useState<History>({})
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>()
    const user = useAppSelector(state => state.auth.user)
    const searchUsers = useAppSelector(state => state.user.searchUser)
    const friendRequests = useAppSelector(state => state.friendRequest.friendRequests)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (friendRequests) {
            const sent = friendRequests.filter((request) => (request.requestSender._id === user._id) && request.status === "pending")
            if (sent) {
                setSentRequests(sent)
            }
        }
    }, [friendRequests])

    useEffect(() => {
        if (!text.trim()) return;

        const timeout = setTimeout(() => {

            const findInHistory = history[text]
            if (findInHistory) {
                dispatch(setSearchUser(findInHistory))
            } else {
                dispatch(searchUser(text)).unwrap().then((res: User[]) =>
                    setHistory((prev) => ({ ...prev, [text]: res }))
                )
            }
        }, 500);

        return () => {
            dispatch(resetSearchUser())
            clearTimeout(timeout);
        }
    }, [text])

    useEffect(() => {
        dispatch(getFriendRequests())
    }, [dispatch])

    const handleSendRequest = async (reqId: string) => {
        try {
            const res = await dispatch(sendFriendRequest(reqId)).unwrap()
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
                <Button variant="outline" size="icon"><Search /></Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Search Friends</SheetTitle>
                    <SheetDescription>
                        Input name to search profile here. Click + when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-username">Name</Label>
                        <Input value={text} onChange={e => setText(e.target.value)} id="sheet-demo-username" placeholder="John Doe" />
                    </div>
                    <ScrollArea className="grow ">
                        {searchUsers && searchUsers.map((item) => (
                            <div key={item._id} className={` ${user._id === item._id ? "hidden" : "flex"}  justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl`}>
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
                                <Button
                                    onClick={() => handleSendRequest(item._id)}
                                    disabled={
                                        user.Chats &&
                                        user.Chats.some(chat => chat._id === item._id) ||
                                        sentRequests.some((request) => request.requestReceiver._id === item._id)
                                    }
                                    variant="outline"
                                    size="icon"
                                >
                                    {
                                        user.Chats &&
                                            user.Chats.some(chat => chat._id === item._id) ?
                                            <Verified /> :
                                            sentRequests.some((request) => request.requestReceiver._id === item._id) ?
                                                <UserCheck2 /> :
                                                <UserPlus2 />
                                    }
                                </Button>

                            </div>
                        ))}

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
