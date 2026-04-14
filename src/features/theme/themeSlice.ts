import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name : "theme",
    initialState:{
        showSearch : false,
        showUserInfo:false,
        showMenu:false,
        showProfileMenu : false
    },
    reducers:{
        toggleShowSearch : (state,action)=>{
            state.showSearch = action.payload
        },
        toggleShowUserInfo : (state,action)=>{
            state.showUserInfo = action.payload
        },
        toggleShowMenu: (state,action)=>{
            state.showMenu = action.payload
        },
        toggleProfileMenu : (state,action)=>{
            state.showProfileMenu = action.payload
        }
        
    }
})

export const {toggleShowSearch,toggleShowUserInfo,toggleShowMenu,toggleProfileMenu} = themeSlice.actions

export default themeSlice.reducer