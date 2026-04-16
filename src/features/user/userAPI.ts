import { ApiResponse } from "@/types/ApiResponse"
import axiosInstance from "../../services/API/axiosInstans"
export const getUserByIdAPI = async (userId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/user/${userId}/user`)
    return res.data
}

export const searchUserAPI = async (query: string): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/user/search`, { params: { name: query } })
    return res.data
}

export const getOnlineUsersAPI = async (): Promise<ApiResponse> => {
    const res = await axiosInstance.get("/user/onlineUser")
    return res.data
}

export const blockUserAPI = async (chatId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/user/block/${chatId}`)
    return res.data
}
export const unBlockUserAPI = async (chatId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/user/unblock/${chatId}`)
    return res.data
}

