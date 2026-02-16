
import axiosInstance from "../../services/API/axiosInstans"


export const messageAPI = async(peerId)=>{
    
    const res = await axiosInstance.get(`/message/direct/${peerId}`)
    return res.data
}

export const groupMessageAPI = async(groupId)=>{
    const res = await axiosInstance.get(`/message/group/${groupId}`)
    return res.data
}

