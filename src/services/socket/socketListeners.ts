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
import { Toast } from "../../pages/Home2";
import * as z from "zod";
import type { Socket } from "socket.io-client";
import { MessageSchema } from "@/schemas/MessageSchema";
import { TypingSchema } from "@/schemas/TypingSchema";
import { OnlineSchema } from "@/schemas/OnlineSchema";

type SocketMessage = z.infer<typeof MessageSchema>;
type TypingEvent = z.infer<typeof TypingSchema>;
type OnlineEvent = z.infer<typeof OnlineSchema>;

export const registerSocketListener = (socket: Socket) => {
  const user = store.getState().auth.user;

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  // -------------------- Direct Messages --------------------
  socket.on("direct:message", (message: SocketMessage) => {
    Toast(message, user._id);

    store.dispatch(
      addMessage({
        userId : user._id,
        message,
      })
    );

    store.dispatch(
      addAlert({
        chatId: message.sender,
        message,
      })
    );
  });

  // -------------------- Group Messages --------------------
  socket.on("group:message", (message: SocketMessage) => {

    const { group } = message;

    store.dispatch(
      addMessage({
        chatId: group,
        message,
      })
    );

    store.dispatch(
      addAlert({
        chatId: group,
        message,
      })
    );
  });

  socket.on("typing:start", (data: TypingEvent) => {
    store.dispatch(addTyping(data));
  });

  socket.on("typing:stop", (data: TypingEvent) => {
    store.dispatch(removeTyping(data));
  });

  socket.on("user:online", (data: OnlineEvent) => {
    store.dispatch(addOnlineUser(data));
  });

  socket.on("user:offline", (data: OnlineEvent) => {
    store.dispatch(removeOnlineUser(data));
  });

  socket.on("disconnect", () => {
    const typingUsers = store.getState().notification.typing;

    typingUsers.forEach((user) => {
      store.dispatch(removeTyping(user));
    });
  });
};
