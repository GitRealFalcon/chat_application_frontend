import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { messageAPI, groupMessageAPI, updateMessageStatusAPI } from "./chatAPI";
import { Message } from "@/types/Message";

type messages = {
  [id: string]: Message[]
}
type ChatState = {
  messages: messages,
  activeChat: ActiveChat,
  loading: boolean,
  error: string | null
}

export type ActiveChat = {
  _id: string,
  chat: string,
  title: string,
  avatar: string
}


export const getMessage = createAsyncThunk<any, string>(
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


export const getGroupMessage = createAsyncThunk<any, string>(
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

export const updateMessageStatus = createAsyncThunk(
  "chat/updateStatus",
  async (peerId: string, thunkAPI)=>{
      try {
        const res = await updateMessageStatusAPI(peerId)
        return res.message
      } catch (error) {
        return thunkAPI.rejectWithValue(
        error.response?.data || "update message status error"
      );
      }
  }
)

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: {},
    activeChat: {},
    loading: false,
    error: null,

  } as ChatState,

  reducers: {

    addMessage: (state, action) => {
      const { message, userId } = action.payload;

      const chatId =
        message.group ||
        (message.sender === userId
          ? message.receiver
          : message.sender)


      state.messages[chatId] ??= [];
      state.messages[chatId].push(message);
    },

    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    clearActiveChat: (state)=>{
      state.activeChat = {} as ActiveChat
    }
   
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
        state.error = (action.payload as string) || "Failed to get messages";
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
        state.error = (action.payload as string) || "Failed to get group messages";
      });
  },
});

export const { addMessage, setActiveChat, clearActiveChat } = chatSlice.actions;
export default chatSlice.reducer;
