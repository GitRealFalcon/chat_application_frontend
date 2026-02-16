import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name : "theme",
    initialState:{
        showSearch : false,
        showUserInfo:false
    },
    reducers:{
        toggleShowSearch : (state)=>{
            state.showSearch = !state.showSearch
        },
        toggleShowUserInfo : (state,action)=>{
            state.showUserInfo = action.payload
        }
    }
})

export const {toggleShowSearch,toggleShowUserInfo} = themeSlice.actions

export default themeSlice.reducer