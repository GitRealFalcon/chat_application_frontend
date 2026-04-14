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
import { Search, UserPlus2 } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function SearchSheet() {
    const sidebarItems = [
        {
            title: "John Doe",
            url: "/chat/john",
            avatar: "https://i.pravatar.cc/150?img=1",
            lastMessage: "Hey, are we meeting today?",
            time: "10:45 AM",
            unread: 2,
            online: true,
        },
        {
            title: "Emma Watson",
            url: "/chat/emma",
            avatar: "https://i.pravatar.cc/150?img=5",
            lastMessage: "Sent the files ✔✔",
            time: "9:30 AM",
            unread: 0,
            online: false,
        },
        {
            title: "Team Project",
            url: "/chat/team",
            avatar: "https://i.pravatar.cc/150?img=12",
            lastMessage: "Meeting starts in 15 mins",
            time: "Yesterday",
            unread: 8,
            online: true,
        },
        {
            title: "Sophia",
            url: "/chat/sophia",
            avatar: "https://i.pravatar.cc/150?img=20",
            lastMessage: "😂😂😂",
            time: "Yesterday",
            unread: 1,
            online: false,
        },
        {
            title: "Alex",
            url: "/chat/alex",
            avatar: "https://i.pravatar.cc/150?img=15",
            lastMessage: "Voice message",
            time: "Mon",
            unread: 0,
            online: true,
        },
    ]
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
                        <Input id="sheet-demo-username" placeholder="John Doe" />
                    </div>
                    <ScrollArea className="grow ">
                        {sidebarItems.map((item) => (
                            <div key={item.title} className="flex justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl">
                                <div className="flex gap-2">
                                    <Avatar>
                                        <AvatarImage
                                            src={item.avatar}
                                            className="h-full w-full object-cover"
                                        />
                                        <AvatarFallback>
                                            {item.title.slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{item.title}</span>
                                </div>
                                <Button variant="outline" size="icon"><UserPlus2 /></Button>
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
