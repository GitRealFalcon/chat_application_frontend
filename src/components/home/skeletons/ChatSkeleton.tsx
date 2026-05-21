import { Skeleton } from '@/components/ui/skeleton'

const ChatSkeleton = ({ value }: { value: number }) => {
  return (
    <div className={`${value % 2 === 0 ? 'ml-auto' : ''}`}>
      <Skeleton  className='w-32 h-5 bg-muted-foreground'/>
      <Skeleton className={`${value % 2 === 0 ? 'ml-auto' : ''} w-20 h-4 mt-2 bg-muted-foreground`}/>
    </div>
  )
}

export default ChatSkeleton
