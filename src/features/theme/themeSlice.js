import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name : "theme",
    initialState:{
        showSearch : false,
        showUserInfo:false,
        showMenu:false
    },
    reducers:{
        toggleShowSearch : (state)=>{
            state.showSearch = !state.showSearch
        },
        toggleShowUserInfo : (state,action)=>{
            state.showUserInfo = action.payload
        },
        toggleShowMenu: (state,action)=>{
            state.showMenu = action.payload
        }
        
    }
})

export const {toggleShowSearch,toggleShowUserInfo,toggleShowMenu} = themeSlice.actions

export default themeSlice.reducer