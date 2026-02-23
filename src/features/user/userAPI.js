import axiosInstance from "../../services/API/axiosInstans"
export const getUserByIdAPI = async (userId)=>{
    const res = await axiosInstance.get(`/user/${userId}/user`)
    return res.data
}

export const searchUserAPI = async (query)=>{
    const res = await axiosInstance.get(`/user/search`,{params:{name:query}})
    return res.data
}

export const getOnlineUsersAPI = async ()=>{
    const res = await axiosInstance.get("/user/onlineUser")
    return res.data
}

export const addChatAPI = async(data)=>{
    const res = await axiosInstance.patch("/user/add",data)
    return res.data
}