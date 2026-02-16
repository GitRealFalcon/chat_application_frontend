import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, meAPI } from "./authAPI";

export const loginUser = createAsyncThunk(
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

export const registerUser = createAsyncThunk(
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

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authChecked: false,
    message: null,
    
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
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
        state.success = action.payload.success
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
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
