import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { getOnlineUsersAPI, getUserByIdAPI, searchUserAPI, blockUserAPI, unBlockUserAPI } from "./userAPI";
import { User } from "@/types/User";
import type { RootState } from "@/App/store";

type UserState = {
  onlineUser: string[];
  searchUser: User[];
  userById: User;
  error: string | null;
  loading: boolean;
};

const extractOnlineUsers = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map(String);
  }

  if (payload && typeof payload === "object") {
    const obj = payload as {
      onlineUser?: unknown;
      data?: unknown;
    };

    if (Array.isArray(obj.onlineUser)) {
      return obj.onlineUser.map(String);
    }

    if (Array.isArray(obj.data)) {
      return obj.data.map(String);
    }

    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as { onlineUser?: unknown }).onlineUser)
    ) {
      return ((obj.data as { onlineUser: unknown[] }).onlineUser).map(String);
    }
  }

  return [];
};

export const getOnlineUser = createAsyncThunk<string[], void, { rejectValue: string }>(
  "user/getOnlineUser",
  async (_, thunkAPI) => {
    try {
      const res = await getOnlineUsersAPI();
      return extractOnlineUsers(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "get onlineUser error",
      );
    }
  },
);


export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId: string, thunkAPI) => {
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

export const blockUser = createAsyncThunk(
  "user/blockUser",
  async (chatId: string, thunkAPI) => {
    try {
      const res = await blockUserAPI(chatId);
      return res
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Block user error",
      );
    }
  },
);

export const unBlockUser = createAsyncThunk(
  "user/unBlockUser",
  async (chatId: string, thunkAPI) => {
    try {
      const res = await unBlockUserAPI(chatId);
      return res
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "unBlock user error",
      );
    }
  },
);


export const searchUser = createAsyncThunk(
  "user/searchUser",
  async (query: string, thunkAPI) => {
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
    userById: {},
    error: null,
    loading: false,
  } as UserState,

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
    resetSearchUser: (state) => {
      state.searchUser = []
    },
    setSearchUser: (state, action) => {
      state.searchUser = action.payload
    }
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
        state.userById = action.payload as User;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "get UserById error");
      })


      .addCase(searchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.searchUser = action.payload ? action.payload as User[] : [];
      })
      .addCase(searchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "searchUser error");
      })

  },
});

export const { addOnlineUser, removeOnlineUser, resetSearchUser, setSearchUser } = userSlice.actions;

const selectUserState = (state: RootState) => state.user

export const selectOnlineUsers = createSelector(selectUserState, (user) => user.onlineUser)
export const selectSearchUsers = createSelector(selectUserState, (user) => user.searchUser)

export default userSlice.reducer;
