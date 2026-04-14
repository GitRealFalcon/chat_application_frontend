 import { ApiResponse } from "@/types/ApiResponse";
import axiosInstance from "../../services/API/axiosInstans"

export type LoginPayload = {
   email: string;
   password: string;
};

export type RegisterPayload = {
   email: string;
   name: string;
   password: string;
};

 export const loginAPI = async (data: LoginPayload): Promise<ApiResponse>=>{
        const res = await axiosInstance.post("/auth/login",data)
        const token = res.data.data?.accessToken
        if (token) {
         localStorage.setItem("token",token)
        }
        return res.data
 }

 export const registerAPI = async(data: RegisterPayload): Promise<ApiResponse>=>{
    const res = await axiosInstance.post("/auth/register", data)
    return res.data
 }

 export const meAPI = async (): Promise<ApiResponse>=>{
    const res = await axiosInstance.get("/auth/me")
    return res.data
 }

 export const logoutAPI = async (): Promise<ApiResponse>=>{
   const res =await axiosInstance.post("/auth/logout")
   return res.data
 }