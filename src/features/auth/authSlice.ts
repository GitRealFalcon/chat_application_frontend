import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginAPI,
  registerAPI,
  meAPI,
  logoutAPI,
  type LoginPayload,
  type RegisterPayload,
} from "./authAPI";
import { User } from "@/types/User";

export const loginUser = createAsyncThunk<any, LoginPayload>(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      return await loginAPI(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk<any, RegisterPayload>(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      return await registerAPI(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "register failed"
      );
    }
  }
);

export const getUser = createAsyncThunk(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      return await meAPI();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Me failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI)=>{
    try {
      return await logoutAPI()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Logout failed")
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:<User> {},
    isAuthenticated: false,
    loading: false,
    error: null,
    authChecked: false,
    message: null,
    success: null,
    
  },
  reducers:{
    logout: (state)=>{
      state.user = null
      state.isAuthenticated =false
      state.message = null
      state.loading = false
    }
  },
 
  extraReducers: (builder) => {


    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null
        state.message = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.success = action.payload.success 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.success = (action.payload as any)?.success
      })


      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state,action) => {
        state.loading = false;
        state.message = action.payload.message || "Register success"
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
      })

  
      .addCase(getUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data as User;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(logoutUser.pending, (state)=>{
        state.error = null,
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state)=>{
        state.isAuthenticated = false
        state.loading = false
        state.user = null
      })
      .addCase(logoutUser.rejected,(state,action)=>{
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
  }
});

export const {logout} = authSlice.actions
export default authSlice.reducer;
