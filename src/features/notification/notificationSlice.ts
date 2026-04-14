import { AlertMSG } from "@/types/AlertMSG";
import { Typing } from "@/types/Typing";
import { createSlice } from "@reduxjs/toolkit";
type NotificationState = {
  alertMSG: AlertMSG[],
  typing: Typing[]
}
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    alertMSG: [],   
    typing: []      
  } as NotificationState,

  reducers: {

    
    addAlert: (state, action) => {
      state.alertMSG.push(action.payload);
    },

    
    removeAlert: (state, action) => {
      const msgId = String(action.payload);
      state.alertMSG = state.alertMSG.filter(
        (e) => e.message.msgId !== msgId
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
      const userId = action.payload.userId;
      state.typing = state.typing.filter(
        (e) => e.userId !== userId
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
