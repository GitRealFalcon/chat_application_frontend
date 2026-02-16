import axiosInstance from "../../services/API/axiosInstans";

export const createGroupAPI = async (data)=>{
    const res = await axiosInstance.post(`/group/`,data)
    return res.data
}

export const getGroupByIdAPI = async (groupId)=>{
    const res = await axiosInstance.get(`/group/${groupId}`)
    return res.data
}

export const addGroupMembersAPI = async (data,groupId)=>{
    const res = await axiosInstance.post(`/group/${groupId}/members`, data)
    return res.data
}

export const removeGroupMember = async (data,groupId)=>{
    const res = await axiosInstance.delete(`/group/${groupId}/members`, data)
    return res.data
}

export const isGroupMemberAPI = async(data,groupId)=>{
    const res = await axiosInstance.get(`/group/${groupId}/isMember`,data)
    return res.data
}