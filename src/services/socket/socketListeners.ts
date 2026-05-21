import store from "../../App/store";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import * as z from "zod";
import {
  addAlert,
  addTyping,
  removeTyping,
} from "../../features/notification/notificationSlice";
import {
  addMessage,
  patchMessageStatus,
  reconcileMessageSentAck,
  upsertConversations,
} from "../../features/chat/chatSlice";
import { addOnlineUser, removeOnlineUser } from "../../features/user/userSlice";
import { OnlineSchema } from "@/schemas/OnlineSchema";
import { TypingSchema } from "@/schemas/TypingSchema";
import { Message } from "@/types/Message";

const incomingMessageSchema = z.object({
  _id: z.string().optional(),
  sender: z.string(),
  receiver: z.string().optional(),
  text: z.string(),
  status: z.enum(["sent", "delivered", "read"]).optional(),
  group: z.string().optional(),
  chatId: z.string().optional(),
  deliveredTo: z.array(z.string()).optional(),
  readBy: z.array(z.string()).optional(),
  clientMsgId: z.string().optional(),
  conversationId: z.string().optional(),
  localStatus: z.enum(["sending", "sent", "delivered", "read", "failed"]).optional(),
  type: z.enum(["sending", "text", "image", "video", "document"]).optional(),
  ts: z.union([z.date(), z.string(), z.number()]),
});

const sentAckSchema = z.object({
  clientMsgId: z.string(),
  conversationId: z.string().optional(),
  sender: z.string().optional(),
  receiver: z.string().optional(),
  text: z.string().optional(),
  ts: z.union([z.date(), z.string(), z.number()]).optional(),
  type: z.enum(["sending", "text", "image", "video", "document"]).optional(),
  message: incomingMessageSchema.optional(),
  data: incomingMessageSchema.optional(),
});

const statusUpdateSchema = z.object({
  conversationId: z.string(),
  messageId: z.string().optional(),
  readUptoMessageId: z.string().optional(),
  clientMsgId: z.string().optional(),
  status: z.enum(["delivered", "read"]),
});

const conversationUpdateSchema = z.union([
  z.object({
    conversation: z.any(),
  }),
  z.object({
    data: z.any(),
  }),
  z.array(z.any()),
  z.any(),
]);

type SocketMessage = z.infer<typeof incomingMessageSchema>;
type TypingEvent = z.infer<typeof TypingSchema>;
type OnlineEvent = z.infer<typeof OnlineSchema>;

const normalizeMessage = (message: SocketMessage, fallbackConversationId?: string): Message => {
  const resolvedConversationId =
    message.conversationId ??
    message.group ??
    message.chatId ??
    fallbackConversationId ??
    message.receiver ??
    message.sender;

  return {
    ...message,
    conversationId: resolvedConversationId,
    chatId: message.chatId ?? resolvedConversationId,
    localStatus: message.localStatus ?? message.status ?? "sent",
    ts: message.ts instanceof Date ? message.ts : new Date(message.ts),
    type: message.type ?? "text",
  };
};

const normalizeConversationItem = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const peer = data.peer && typeof data.peer === "object"
    ? (data.peer as Record<string, unknown>)
    : null;
  const _id = String(data._id ?? data.conversationId ?? data.id ?? "");

  if (!_id) {
    return null;
  }

  const resolvedName =
    (typeof data.name === "string" ? data.name : undefined) ??
    (typeof data.title === "string" ? data.title : undefined) ??
    (typeof peer?.displayName === "string" ? peer.displayName : undefined) ??
    (typeof peer?.name === "string" ? peer.name : undefined);

  const resolvedAvatar =
    (typeof data.avatar === "string" ? data.avatar : undefined) ??
    (typeof peer?.avatarUrl === "string" ? peer.avatarUrl : undefined);

  const normalizedLastMessage =
    data.lastMessage && typeof data.lastMessage === "object"
      ? normalizeMessage(data.lastMessage as SocketMessage, _id)
      : undefined;

  const updatedAt =
    (typeof data.updatedAt === "string" ? data.updatedAt : undefined) ??
    (typeof data.lastMessageAt === "string" ? data.lastMessageAt : undefined);

  return {
    _id,
    participantId: typeof data.participantId === "string"
      ? data.participantId
      : typeof peer?._id === "string"
        ? peer._id
        : undefined,
    name: resolvedName,
    title: resolvedName,
    avatar: resolvedAvatar,
    chat: typeof data.type === "string" ? data.type : "direct",
    unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : undefined,
    lastMessage: normalizedLastMessage,
    updatedAt,
  };
};

export const registerSocketListener = (socket: Socket) => {
  const user = store.getState().auth.user;

  socket.off("message:new");
  socket.off("message:sent");
  socket.off("message:status:update");
  socket.off("conversation:update");
  socket.off("direct:message");
  socket.off("group:message");
  socket.off("typing:start");
  socket.off("typing:stop");
  socket.off("user:online");
  socket.off("user:offline");
  socket.off("error");
  socket.off("disconnect");

  const handleIncomingMessage = (message: SocketMessage) => {
    const normalizedMessage = normalizeMessage(message);

    store.dispatch(
      addMessage({
        userId: user?._id,
        conversationId: normalizedMessage.conversationId,
        message: normalizedMessage,
      })
    );

    if (normalizedMessage.sender !== user?._id) {
      store.dispatch(
        addAlert({
          chatId: normalizedMessage.conversationId,
          message: normalizedMessage,
        })
      );
    }
  };

  socket.on("message:new", (message: SocketMessage) => {
    handleIncomingMessage(message);
  });

  socket.on("message:sent", (payload: unknown) => {
    const parsed = sentAckSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    const fallbackMessage: SocketMessage | undefined =
      parsed.data.sender && parsed.data.text && parsed.data.ts
        ? {
          sender: parsed.data.sender,
          receiver: parsed.data.receiver,
          text: parsed.data.text,
          ts: parsed.data.ts,
          conversationId: parsed.data.conversationId,
          clientMsgId: parsed.data.clientMsgId,
          type: parsed.data.type,
        }
        : undefined;

    const message = parsed.data.message ?? parsed.data.data ?? fallbackMessage;
    if (!message) {
      return;
    }

    const normalizedMessage = normalizeMessage(message, parsed.data.conversationId);

    store.dispatch(
      reconcileMessageSentAck({
        clientMsgId: parsed.data.clientMsgId,
        conversationId: normalizedMessage.conversationId,
        message: normalizedMessage,
      })
    );
  });

  socket.on("message:status:update", (payload: unknown) => {
    const parsed = statusUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    store.dispatch(
      patchMessageStatus({
        conversationId: parsed.data.conversationId,
        messageId: parsed.data.messageId ?? parsed.data.readUptoMessageId,
        clientMsgId: parsed.data.clientMsgId,
        status: parsed.data.status,
      })
    );
  });

  socket.on("conversation:update", (payload: unknown) => {
    const parsed = conversationUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    const candidates: unknown[] = [];
    const value = parsed.data;

    if (Array.isArray(value)) {
      candidates.push(...value);
    } else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (Array.isArray(record.data)) {
        candidates.push(...record.data);
      } else if (record.data && typeof record.data === "object") {
        candidates.push(record.data);
      } else if (record.conversation) {
        candidates.push(record.conversation);
      } else {
        candidates.push(record);
      }
    }

    const conversations = candidates
      .map((item) => normalizeConversationItem(item))
      .filter(Boolean);

    if (conversations.length > 0) {
      store.dispatch(upsertConversations(conversations as never));
    }
  });

  // Temporary legacy aliases while older backend emits are still supported.
  socket.on("direct:message", (message: SocketMessage) => {
    handleIncomingMessage(message);
  });

  socket.on("group:message", (message: SocketMessage) => {
    handleIncomingMessage(message);
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

  socket.on("error", (data: string) => {
    toast.error(data, { position: "top-right" });
  });

  socket.on("disconnect", () => {
    const typingUsers = store.getState().notification.typing;

    typingUsers.forEach((typingUser) => {
      store.dispatch(removeTyping(typingUser));
    });
  });
};
