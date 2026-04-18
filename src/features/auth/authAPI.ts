import { ApiResponse } from "@/types/ApiResponse";
import axiosInstance from "../../services/API/axiosInstans"
import z from "zod";
import { singUpSchema } from "@/schemas/singUpSchema";
import { signInSchema } from "@/schemas/signInSchema";


export const loginAPI = async (data: z.infer<typeof signInSchema>): Promise<ApiResponse> => {
   const res = await axiosInstance.post("/auth/login", data)
   const token = res.data.data?.accessToken
   if (token) {
      localStorage.setItem("token", token)
   }
   return res.data
}

export const registerAPI = async (data: z.infer<typeof singUpSchema>): Promise<ApiResponse> => {
   const res = await axiosInstance.post("/auth/register", data)
   return res.data
}

export const meAPI = async (): Promise<ApiResponse> => {
   const res = await axiosInstance.get("/auth/me")
   return res.data
}

export const logoutAPI = async (): Promise<ApiResponse> => {
   const res = await axiosInstance.post("/auth/logout")
   return res.data
}
export const verificationAPI = async (data: { email: string, code: string }): Promise<ApiResponse> => {
   const res = await axiosInstance.post("/auth/verification", data)
   return res.data
}
export const generateCodeAPI = async (email: string): Promise<ApiResponse> => {
   const res = await axiosInstance.patch(`/auth/generate/${email}`)
   return res.data
}