import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { loginUser } from '../features/auth/authSlice'
import { useAppDispatch,useAppSelector } from '../App/hooks'
import { Navigate } from 'react-router-dom'
import SpinButton from '../components/Loaders/SpinButton'

const Login = () => {
  const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch()
  const {loading,error,success,message} = useAppSelector(state => state.auth)
  
  const [formData, setformData] = useState({
    email:"",
    password:""
  })

  const handleChange = (e)=>{
    setformData((pre)=>({...pre,[e.target.name]:e.target.value}))
  }

  const handleClick = async()=>{
    dispatch(loginUser(formData))
    setformData({
      email:"",
      password:""
    })
  }
  return (
   user ? <Navigate to="/" replace/> : <div className=' h-screen flex justify-center items-center bg-[#0b141a]'>
      <div className='h-2/3 w-96 bg-[#202c33] border-[#052a41] rounded-3xl p-4 flex flex-col justify-around'>
        <div className='text-green-500 text-3xl font-bold text-center font-serif'>Chattify</div>
        <div className='text-center text-gray-400'>
          <div className='text-xl font-semibold text-green-600 text-center'>Login</div>
          <span >Don't have account? </span>
          <Link to={"/register"}>
            <span className='font-semibold'>Register now</span>
          </Link>
        </div>

        <div className=' flex flex-col gap-4'>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-200 p-1' htmlFor="email">Email</label>
            <input onChange={handleChange} className='p-2 rounded-lg placeholder:text-gray-500 text-gray-200 text-lg bg-[#13232e] border-2 border-[#294455] outline-none' value={formData.name} name='email' type="email" id='email' placeholder='Enter Email' />
          </div>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-200 p-1' htmlFor="password">Password</label>
            <input onChange={handleChange} className='p-2 rounded-lg placeholder:text-gray-500 text-gray-200 text-lg bg-[#13232e] border-2 border-[#294455] outline-none' value={formData.password} name='password' type="password" id='password' placeholder='Password' />
          </div>
          <SpinButton loading={loading} clickButton={handleClick} className={"w-full"} text="Login" />
          
          {error && <div className='text-red-500 text-center'>{error.message}</div>}\
          {success && <div className='text-green-500 text-center'>{message}</div>}
        </div>

      </div>
    </div>
  )
}

export default Login
