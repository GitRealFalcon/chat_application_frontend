import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"
import chatReducer from "../features/chat/chatSlice"
import userReducer from "../features/user/userSlice"
import notificationReducer from "../features/notification/notificationSlice"
import themeReducer from "../features/theme/themeSlice"
import groupReducer from "../features/group/groupSlice"


import { injectStore } from "../services/API/axiosInstans";

const store = configureStore({
    reducer:{
        auth:authReducer,
        chat:chatReducer,
        user:userReducer,
        notification:notificationReducer,
        theme:themeReducer,
        group:groupReducer
    }
})

injectStore(store)

export default store