import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../App/hooks'
import { registerUser } from '../features/auth/authSlice'
import SpinButton from '../components/Loaders/SpinButton'

const Register = () => {
  const {loading,error,message} = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const [formData, setformData] = useState({
    email:"",
    name:"",
    password:""
  })

  
  const handleChange = (e)=>{
    setformData(pre =>({...pre,[e.target.name]:e.target.value}))
  }

  const handleClick = ()=>{
    dispatch(registerUser(formData))
    setformData({
      email:"",
      name:"",
      password:""
    })
  }
  return (
    <div className=' h-screen flex justify-center items-center bg-[#0b141a]'>
      <div className='h-2/3 w-96 bg-[#202c33] border-[#1f2c34] rounded-3xl p-4 flex flex-col justify-around'>
        <div className='text-green-500 text-3xl font-bold text-center font-serif'>Chattify</div>
        <div className='text-center text-gray-400'>
          <div className='text-xl font-semibold text-green-600 text-center'>Register</div>
          <span >Allready have a account? </span>
          <Link to={"/login"}>
            <span className='font-semibold'>Login now</span>
          </Link>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-200 p-1' htmlFor="name">Name</label>
            <input onChange={handleChange} value={formData.name} name='name' className='p-2 rounded-lg placeholder:text-gray-500 text-gray-200 text-lg bg-[#13232e] border-2 border-[#294455] outline-none' type="name" id='name' placeholder='Enter Name' />
          </div>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-200 p-1' htmlFor="email">Email</label>
            <input onChange={handleChange} value={formData.email} name='email' className='p-2 rounded-lg placeholder:text-gray-500 text-gray-200 text-lg bg-[#13232e] border-2 border-[#294455] outline-none' type="email" id='email' placeholder='Enter Email' />
          </div>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-200 p-1' htmlFor="password">Password</label>
            <input onChange={handleChange} value={formData.password} name='password' className='p-2 rounded-lg placeholder:text-gray-500 text-gray-200 text-lg bg-[#13232e] border-2 border-[#294455] outline-none' type="password" id='password' placeholder='Password' />
          </div>
          <SpinButton loading={loading} clickButton={handleClick} className={"w-full"} text="Register" />
          {error && <div className='text-red-500 text-center'>{error.message}</div>}
          {message && <div className='text-green-500 text-center'>{message}</div>}
        </div>

      </div>
    </div>
  )
}

export default Register
