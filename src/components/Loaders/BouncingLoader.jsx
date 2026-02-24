import React from 'react'

const BouncingLoader = () => {
  return (
    <div className='flex space-x-2 w-screen min-h-screen bg-[#111b21] justify-center items-center'>
                <div className='h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                <div className='h-3 w-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                <div className='h-3 w-3 bg-blue-500 rounded-full animate-bounce'></div>

            </div>
  )
}

export default BouncingLoader
