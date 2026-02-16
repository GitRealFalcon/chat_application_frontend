import BouncingLoader from '../Loaders/BouncingLoader'

const Chat = ({ Messages = [], selfId, loading }) => {

  const formatTime = (ts) => {
    if (!ts) return ""
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className='flex flex-1 flex-col gap-2 p-4 overflow-y-auto'>

      {loading && <BouncingLoader />}

      {!loading && Messages.map((message) => {

        const isMe = selfId === message.sender

        return (
          <div
            key={message.msgId}
            className={`max-w-[70%] ${isMe ? "self-end" : "self-start"}`}
          >
            <div
              className={`rounded-b-lg px-3 py-2 text-sm ${
                isMe ? "bg-[#005c4b] rounded-l-lg" : "bg-[#202c33] rounded-r-lg"
              }`}
            >
              {message.text}
            </div>

            <div
              className={`mt-1 text-[11px] text-[#8696a0] ${
                isMe ? "text-right" : "text-left"
              }`}
            >
              {formatTime(message.ts)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Chat
