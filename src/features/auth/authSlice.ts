import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginAPI,
  registerAPI,
  meAPI,
  logoutAPI,
  generateCodeAPI,
  verificationAPI
} from "./authAPI";
import { User } from "@/types/User";
import { ApiResponse } from "@/types/ApiResponse";
import z from "zod";
import { singUpSchema } from "@/schemas/singUpSchema";
import { signInSchema } from "@/schemas/signInSchema";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: z.infer<typeof signInSchema>, thunkAPI) => {
    try {
      return await loginAPI(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: z.infer<typeof singUpSchema>, thunkAPI) => {
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
export const verification = createAsyncThunk(
  "auth/verification",
  async (data:{email: string, code: string}, thunkAPI)=>{
    try {
      const res = await verificationAPI(data)
      return res
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "verification failed")
    }
  }
)
export const generateCode = createAsyncThunk(
  "auth/generateCode",
  async (email: string, thunkAPI)=>{
    try {
      return await generateCodeAPI(email)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "generateCode failed")
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authChecked: false,
    message: null,
    success: null,
    verificationExpiry: null as Date | null
  },
  reducers:{
    logout: (state)=>{
      state.user = null
      state.isAuthenticated =false
      state.authChecked = true;
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
        state.authChecked = true;
        state.success = action.payload.success 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.authChecked = true;
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
        state.verificationExpiry = (action.payload.data as any)?.verificationExpiry
        
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        
      })

      .addCase(generateCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(generateCode.fulfilled, (state,action) => {
        state.loading = false;
        state.message = action.payload.message || "generateCode success"
        state.verificationExpiry = (action.payload.data as any)?.verificationExpiry
        
      })
      .addCase(generateCode.rejected, (state, action) => {
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
        state.authChecked = true;
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
