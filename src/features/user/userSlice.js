import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOnlineUsersAPI, getUserByIdAPI, searchUserAPI } from "./userAPI";

// 🔹 Get Online Users
export const getOnlineUser = createAsyncThunk(
  "user/getOnlineUser",
  async (_, thunkAPI) => {
    try {
      const res = await getOnlineUsersAPI();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "get onlineUser error",
      );
    }
  },
);

// 🔹 Get User By Id
export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, thunkAPI) => {
    try {
      const res = await getUserByIdAPI(userId);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "get UserById error",
      );
    }
  },
);

// 🔹 Search User
export const searchUser = createAsyncThunk(
  "user/searchUser",
  async (query, thunkAPI) => {
    try {
      const res = await searchUserAPI(query);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "searchUser error",
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",

  initialState: {
    onlineUser: [], 
    searchUser: [], 
    userById: null,
    error: null,
    loading: false,
  },

  reducers: {
    addOnlineUser: (state, action) => {
      const userId = String(action.payload.userId);

      if (!state.onlineUser.includes(userId)) {
        state.onlineUser.push(userId);
      }
    },

    removeOnlineUser: (state, action) => {
      const userId = String(action.payload.userId);

      state.onlineUser = state.onlineUser.filter((id) => id !== userId);
    },
  },

  extraReducers: (builder) => {
    builder

     
      .addCase(getOnlineUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOnlineUser.fulfilled, (state, action) => {
        state.loading = false;
        state.onlineUser = action.payload;
      })
      .addCase(getOnlineUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.userById = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(searchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.searchUser = action.payload;
      })
      .addCase(searchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addOnlineUser, removeOnlineUser } = userSlice.actions;
export default userSlice.reducer;
