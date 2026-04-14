import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Moon, Settings, Sun, User2, UserRoundXIcon } from 'lucide-react'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme-provider'
import { SearchSheet } from './SearchSheet'
import { ChatProfileSheet } from './ChatProfileSheet'
import { useAppSelector,useAppDispatch } from '@/App/hooks'
import { directTyping } from '@/utils/helpers'

const HomeNavbar = () => {
  const { setTheme } = useTheme()
  const activeChat = useAppSelector(state => state.chat.activeChat)
  const {onlineUser} = useAppSelector(state=> state.user)
  const {typing} = useAppSelector(state=> state.notification)


  return (
    <div className='sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      {/* Left */}
      <div className='flex gap-2 items-center'>
        <SidebarTrigger />
        {/* Chat Profile */}
        {<DropdownMenu>
          <DropdownMenuTrigger >
            <div className='flex gap-3 items-center'>
              <Avatar>
                <AvatarImage src={activeChat.avatar} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
                <AvatarBadge className={`${onlineUser.includes(activeChat._id) && "bg-green-600 dark:bg-green-800"} `} />
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-semibold capitalize text-start'>{activeChat.title}</span>
                <span className='text-green-500 w-fit h-3 text-xs'>{activeChat?.chat === "direct" ? directTyping(typing,activeChat._id) : ""}</span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>{activeChat.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ChatProfileSheet
              trigger={
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <User2 />
                  Profile
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem variant='destructive' asChild>
              <Link to={`/dashboard/settings`}>
                <UserRoundXIcon /> Block
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
      {/* Right */}
      <div className='flex items-center gap-4'>
        {/* Search Sheet */}
        <SearchSheet/>
        {/* Theme Menu  */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}


      </div>
    </div>
  )
}

export default HomeNavbar
