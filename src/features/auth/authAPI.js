 import axiosInstance from "../../services/API/axiosInstans"

 export const loginAPI = async (data)=>{
        const res = await axiosInstance.post("/auth/login",data)
        const token = res.data.data?.accessToken
        if (token) {
         localStorage.setItem("token",token)
        }
        return res.data
 }

 export const registerAPI = async(data)=>{
    const res = await axiosInstance.post("/auth/register", data)
    return res.data
 }

 export const meAPI = async ()=>{
    const res = await axiosInstance.get("/auth/me")
    return res.data
 }

 export const logoutAPI = async ()=>{
   const res =await axiosInstance.post("/auth/logout")
   return res.data
 }