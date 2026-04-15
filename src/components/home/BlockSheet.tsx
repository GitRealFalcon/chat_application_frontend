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
import { User2, UserPlus2 } from "lucide-react"
import type { ReactNode } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAppSelector } from "@/App/hooks"

type ProfileSheetProps = {
  trigger?: ReactNode
}

const BlockSheet = ({ trigger }: ProfileSheetProps) => {
  const user = useAppSelector(state => state.auth.user)
  const blocked = user.Chats.filter((chat) => user.Blocked?.includes(chat._id))
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
        <ScrollArea className="grow ">
          {blocked && blocked.map((item) => (
            <div key={item._id} className={` ${user._id === item._id ? "hidden" : "flex"}  justify-between items-center mt-2 bg-muted p-2 border-2 rounded-2xl`}>
              <div className="flex gap-2">
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
              <Button disabled={user.Chats.some(chat => chat._id === item._id)} variant="outline" size="icon"><UserPlus2 /></Button>
            </div>
          ))}

        </ScrollArea>
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
