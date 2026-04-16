import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { friendRequestApi, acceptRequestApi, getRequestsApi, rejectRequestApi, cancelRequestApi } from "./friendRequestApi";
import { User } from "@/types/User";

export type FriendRequest = {
    _id: string,
    requestSender: User,
    requestReceiver: User,
    status: "pending" | "accepted" | "rejected" | "canceled",
    createdAt: Date,
    updatedAt: Date
}

type FriendRequestState = {
    friendRequests: FriendRequest[],
    loading: boolean
}


export const sendFriendRequest = createAsyncThunk(
    "user/sendFriendRequest",
    async (reqId: string, thunkAPI) => {
        try {
            const res = await friendRequestApi(reqId)
            return res.message
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "send friend request error",
            );
        }
    }
)

export const rejectFriendRequest = createAsyncThunk(
    "user/rejectFriendRequest",
    async (reqId: string, thunkAPI) => {
        try {
            const res = await rejectRequestApi(reqId)
            return res.message
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "reject friend request error",
            );
        }
    }
)
export const cancelFriendRequest = createAsyncThunk(
    "user/cancelFriendRequest",
    async (reqId: string, thunkAPI) => {
        try {
            const res = await cancelRequestApi(reqId)
            return res.message
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "cancel friend request error",
            );
        }
    }
)
export const acceptFriendRequest = createAsyncThunk(
    "user/acceptFriendRequest",
    async (reqId: string, thunkAPI) => {
        try {
            const res = await acceptRequestApi(reqId)
            return res.message
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "accept friend request error",
            );
        }
    }
)
export const getFriendRequests = createAsyncThunk(
    "user/getFriendRequest",
    async (_, thunkAPI) => {
        try {
            const res = await getRequestsApi()
            return res
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "get friend request error",
            );
        }
    }
)

const friendRequestSlice = createSlice({
    name:"friendRequest",
    initialState: {
        friendRequests: [],
        loading: false
    } as FriendRequestState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getFriendRequests.pending,(state,action)=>{
            state.loading = true
        })
        .addCase(getFriendRequests.fulfilled,(state,action)=>{
            state.loading = false;
            state.friendRequests = action.payload.data as FriendRequest[]
        })
        .addCase(getFriendRequests.rejected,(state,action)=>{
            state.loading = false
        })
    }

})

export default friendRequestSlice.reducer