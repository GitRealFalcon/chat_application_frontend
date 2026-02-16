import { addMessage } from "../../features/chat/chatSlice";
import {
  addTyping,
  removeTyping,
  addAlert
} from "../../features/notification/notificationSlice";
import {
  addOnlineUser,
  removeOnlineUser
} from "../../features/user/userSlice";
import store from "../../App/store";

export const registerSocketListener = (socket) => {

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  // -------------------- Messages --------------------

  socket.on("direct:message", (message) => {
    console.log("Received direct message:", message);
    store.dispatch(addMessage(message));
    store.dispatch(addAlert(message));
  });

  socket.on("group:message", (message) => {
    store.dispatch(addMessage(message));
    store.dispatch(addAlert(message));
  });

  

  socket.on("typing:start", (data) => {
    console.log("typing started:", data);
    
    store.dispatch(addTyping(data));
  });

  socket.on("typing:stop", (data) => {
    console.log("typing stopped:", data);
    store.dispatch(removeTyping(data));
  });

  
  socket.on("user:online", (data) => {
    console.log("user online:", data);
    
    store.dispatch(addOnlineUser(data));
  });

  socket.on("user:offline", (data) => {
    console.log("user offline", data);
    
    store.dispatch(removeOnlineUser(data));
  });

  
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");

  
    const typingUsers = store.getState().notification.typing;

    typingUsers.forEach(user => {
      store.dispatch(removeTyping(user));
    });
  });
};
