import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    alertMSG: [],   
    typing: []      
  },

  reducers: {

    
    addAlert: (state, action) => {
      state.alertMSG.push(action.payload);
    },

    
    removeAlert: (state, action) => {
      const removeId = String(action.payload);
      state.alertMSG = state.alertMSG.filter(
        (e) => e.msgId !== removeId
      );
    },

   
    addTyping: (state, action) => {
      const isExist = state.typing.some(
        (e) => e.userId === action.payload.userId
      );

      if (!isExist) {
        state.typing.push(action.payload);
      }
    },

    
    removeTyping: (state, action) => {
      const removeId = action.payload.userId;
      state.typing = state.typing.filter(
        (e) => e.userId !== removeId
      );
    }
  }
});

export const {
  addAlert,
  addTyping,
  removeAlert,
  removeTyping
} = notificationSlice.actions;

export default notificationSlice.reducer;
