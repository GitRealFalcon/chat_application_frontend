import Sidebar from '@/components/home/HomeSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import HomeNavbar from '@/components/home/HomeNavbar'
import HomeChats from '@/components/home/HomeChats'

const Home = () => {
  return (
    <SidebarProvider
    >
      <Sidebar />
      <SidebarInset className='h-screen flex flex-col'>
      <HomeNavbar/>
      <HomeChats/>
      </SidebarInset>
    </SidebarProvider>

  )
}

export default Home
