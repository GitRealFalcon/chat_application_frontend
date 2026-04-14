import React from 'react'

type ButtonProps = {
  ButtonText: React.ReactNode
  type?: "button" | "submit" | "reset"
  style?: string
  color?: string
  ButtonClick?: React.MouseEventHandler<HTMLButtonElement>
}

const Button = ({ ButtonText, type = "submit", style = "", color = "", ButtonClick }: ButtonProps) => {
  return (
    <button onClick={ButtonClick} type={type} className={`${style} ${color} cursor-pointer`}>
        {ButtonText}
    </button>
  )
}

export default Button
