import axiosInstance from "@/services/API/axiosInstans";
import { ApiResponse } from "@/types/ApiResponse";

export const friendRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.post(`/request/sent/${reqId}`)
    return res.data
}

export const acceptRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/request/accept/${reqId}`)
    return res.data
}
export const rejectRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/request/reject/${reqId}`)
    return res.data
}
export const cancelRequestApi = async (reqId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.patch(`/request/cancel/${reqId}`)
    return res.data
}
export const getRequestsApi = async (): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/request/get`)
    return res.data
}