
import { ApiResponse } from "@/types/ApiResponse"
import axiosInstance from "../../services/API/axiosInstans"


export const messageAPI = async(peerId: string): Promise<ApiResponse> => {
    
    const res = await axiosInstance.get(`/message/direct/${peerId}`)
    return res.data
}

export const groupMessageAPI = async(groupId: string): Promise<ApiResponse> => {
    const res = await axiosInstance.get(`/message/group/${groupId}`)
    return res.data
}

export const updateMessageStatusAPI = async (peerId:string):Promise<ApiResponse> =>{
    const res = await axiosInstance.patch(`/message/update/${peerId}`)
    return res.data
}
export const deleteOneMessageAPI = async (msgId:string):Promise<ApiResponse> =>{
    const res = await axiosInstance.delete(`/message/one/${msgId}`)
    return res.data
}
export const deleteAllMessageAPI = async (chatId:string):Promise<ApiResponse> =>{
    const res = await axiosInstance.delete(`/message/all/${chatId}`)
    return res.data
}

