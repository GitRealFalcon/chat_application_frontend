import React from 'react'

const Button = ({ButtonText,type="submit",style="",color},ButtonClick) => {
  return (
    <button onClick={ButtonClick} type={type} className={`${style} ${color} cursor-pointer`}>
        {ButtonText}
    </button>
  )
}

export default Button
