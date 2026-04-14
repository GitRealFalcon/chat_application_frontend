import React from 'react'

const Input = ({placeholder,type="text",onInput,value,style}) => {
  return (
   <input className={`${style}`} value={value} onChange={onInput} type={type} placeholder={placeholder} />
  )
}

export default Input
