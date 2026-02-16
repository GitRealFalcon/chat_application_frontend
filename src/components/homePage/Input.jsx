const Input = ({ onInput, onButton, value }) => {

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      onButton()
    }
  }

  return (
    <div className='border-t border-[#1f2c34] bg-[#202c33] px-3 py-2'>
      
      <div className='flex items-center gap-2'>
        
        <button
          type="button"
          className='rounded px-2 py-1 text-2xl font-bold text-[#e9edef] hover:bg-[#2a3942]'
        >
          +
        </button>

        <input
          type="text"
          className='flex-1 rounded-lg border border-[#1f2c34] bg-[#2a3942] px-3 py-2 text-sm text-[#e9edef] outline-none placeholder:text-[#8696a0]'
          placeholder='Type a message'
          onChange={onInput}
          onKeyDown={handleKeyDown}
          value={value}
        />

        <button
          type="button"
          onClick={onButton}
          disabled={!value.trim()}
          className={`rounded-lg px-4 py-2 text-sm font-semibold 
            ${value.trim()
              ? "bg-[#00a884] text-[#0b141a] cursor-pointer"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
        >
          Send
        </button>

      </div>
    </div>
  )
}

export default Input
