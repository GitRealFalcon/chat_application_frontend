import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createGroupAPI,
  addGroupMembersAPI,
  getGroupByIdAPI,
  isGroupMemberAPI,
  removeGroupMember,
} from "./groupAPI";

// 🔹 Create Group
export const createGroup = createAsyncThunk(
  "group/create",
  async (payload, thunkAPI) => {
    try {
      const res = await createGroupAPI(payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "create group error"
      );
    }
  }
);

// 🔹 Add Members
export const addGroup = createAsyncThunk(
  "group/add",
  async (payload, thunkAPI) => {
    try {
      const res = await addGroupMembersAPI(payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "add group error"
      );
    }
  }
);

// 🔹 Get Group By Id
export const getGroups = createAsyncThunk(
  "group/getGroup",
  async (groupId, thunkAPI) => {
    try {
      const res = await getGroupByIdAPI(groupId);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "get group error"
      );
    }
  }
);

// 🔹 Remove Member
export const removeMember = createAsyncThunk(
  "group/removeMember",
  async (payload, thunkAPI) => {
    try {
      const res = await removeGroupMember(payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "remove member error"
      );
    }
  }
);

// 🔹 Is Member
export const isMember = createAsyncThunk(
  "group/isMember",
  async (payload, thunkAPI) => {
    try {
      const res = await isGroupMemberAPI(payload);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "is member error"
      );
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState: {
    groups: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

     
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload.group);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(addGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGroup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(getGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.loading = false;

       
        const group = action.payload;
        const exists = state.groups.find(g => g._id === group._id);

        if (!exists) {
          state.groups.push(group);
        }
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(removeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default groupSlice.reducer;
