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

export const friendRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/user/request/${reqId}`)
    return res.data
}

export const acceptRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/user/accept/${reqId}`)
    return res.data
}
export const rejectRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/user/reject/${reqId}`)
    return res.data
}