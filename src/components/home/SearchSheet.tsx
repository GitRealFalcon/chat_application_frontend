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
import { useEffect, useState } from "react"
import { User } from "@/types/User"
import { setSearchUser, searchUser, resetSearchUser, } from "@/features/user/userSlice"
import { toast } from "sonner"
import { FriendRequest, getFriendRequests, sendFriendRequest } from "@/features/friendRequest/friendRequestSlice"
import { createOrGetDirectConversationAPI } from "@/features/chat/chatAPI"
import { fetchConversationMessages, fetchConversations, setActiveChat, setActiveConversationId } from "@/features/chat/chatSlice"



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

    const getConversationIdFromResponse = (payload: unknown): string | null => {
        if (!payload) return null

        if (typeof payload === "object") {
            const data = payload as Record<string, unknown>

            if (typeof data._id === "string") return data._id
            if (typeof data.conversationId === "string") return data.conversationId

            if (data.conversation && typeof data.conversation === "object") {
                const conversation = data.conversation as Record<string, unknown>
                if (typeof conversation._id === "string") return conversation._id
                if (typeof conversation.conversationId === "string") return conversation.conversationId
            }

            if (data.data && typeof data.data === "object") {
                return getConversationIdFromResponse(data.data)
            }
        }

        return null
    }

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

    const handleOpenConversation = async (targetUser: User) => {
        const targetUserId = targetUser._id
        if (!targetUserId) return

        try {
            const res = await createOrGetDirectConversationAPI(targetUserId)
            const conversationId = getConversationIdFromResponse(res.data) ?? targetUserId

            dispatch(
                setActiveChat({
                    _id: conversationId,
                    chat: "direct",
                    title: targetUser.name,
                    avatar: targetUser.avatar ?? "",
                })
            )
            dispatch(setActiveConversationId(conversationId))
            dispatch(fetchConversationMessages({ conversationId, mode: "initial" }))
            dispatch(fetchConversations({ limit: 20 }))
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "message" in error
            ) {
                toast.error(String((error as any).message), { position: "top-right" })
            } else {
                toast.error("Unable to open conversation", { position: "top-right" })
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
                                {(() => {
                                    const isExistingChat = Boolean(
                                        user.Chats && user.Chats.some(chat => chat._id === item._id)
                                    )

                                    const hasPendingRequest = Boolean(
                                        sentRequests && sentRequests.some((request) => request.requestReceiver._id === item._id)
                                    )

                                    const handlePrimaryAction = () => {
                                        if (isExistingChat) {
                                            void handleOpenConversation(item)
                                            return
                                        }

                                        void handleSendRequest(item._id)
                                    }

                                    return (
                                <Button
                                    onClick={handlePrimaryAction}
                                    disabled={hasPendingRequest}
                                    variant="outline"
                                    size="icon"
                                >
                                    {
                                        isExistingChat ?
                                            <Verified /> :
                                            hasPendingRequest ?
                                                <UserCheck2 /> :
                                                <UserPlus2 />
                                    }
                                </Button>
                                    )
                                })()}

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
