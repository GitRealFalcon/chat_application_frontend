import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { messageAPI, groupMessageAPI } from "./chatAPI";


export const getMessage = createAsyncThunk(
  "chat/getMessage",
  async (peerId, thunkAPI) => {
    try {
      const res = await messageAPI(peerId);
      return { chatId: peerId, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Get message error"
      );
    }
  }
);


export const getGroupMessage = createAsyncThunk(
  "chat/getGroupMessage",
  async (groupId, thunkAPI) => {
    try {
      const res = await groupMessageAPI(groupId);
      return { chatId: groupId, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Get group message error"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: {},    
    activeChat: null,
    loading: false,
    error: null,
  },

  reducers: {
   
    addMessage: (state, action) => {
      const message = action.payload;

     
      const chatId = message.group
        ? message.group
        : message.sender === state.activeChat?.id
        ? message.sender
        : message.receiver;

      state.messages[chatId] ??= [];
      state.messages[chatId].push(message);
    },

    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(getMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessage.fulfilled, (state, action) => {
        const { chatId, data } = action.payload;
        state.messages[chatId] = data;
        state.loading = false;
      })
      .addCase(getMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(getGroupMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupMessage.fulfilled, (state, action) => {
        const { chatId, data } = action.payload;
        state.messages[chatId] = data;
        state.loading = false;
      })
      .addCase(getGroupMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, setActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
