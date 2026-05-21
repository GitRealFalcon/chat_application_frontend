import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  deleteAllMessageAPI,
  deleteOneMessageAPI,
  getConversationMessagesAPI,
  groupMessageAPI,
  listConversationsAPI,
  messageAPI,
  patchMessageStatusAPI,
  updateMessageStatusAPI,
  type MessageStatusPayload,
} from "./chatAPI";
import { Message } from "@/types/Message";
import type { RootState } from "@/App/store";

export type ActiveChat = {
  _id: string;
  chat: string;
  title: string;
  avatar: string;
  participantId?: string;
};

export type ConversationListItem = {
  _id: string;
  participantId?: string;
  name?: string;
  title?: string;
  avatar?: string;
  chat?: string;
  isGroup?: boolean;
  unreadCount?: number;
  lastMessage?: Message;
  updatedAt?: string;
};

type MessageLocalStatus = "sending" | "sent" | "delivered" | "read" | "failed";

type ConversationMessagesBucket = {
  ids: string[];
  entities: Record<string, Message>;
  nextCursor: string | null;
  hasMore: boolean;
  isInitialLoading: boolean;
  isFetchingOlder: boolean;
  error: string | null;
};

type PendingMessage = {
  conversationId: string;
  createdAt: number;
  errorReason?: string;
};

type LegacyMessages = {
  [id: string]: Message[];
};

type ChatState = {
  conversationsById: Record<string, ConversationListItem>;
  conversationIds: string[];
  activeConversationId: string | null;
  conversationListCursor: string | null;
  hasMoreConversations: boolean;
  isConversationsLoading: boolean;
  conversationListError: string | null;
  messagesByConversationId: Record<string, ConversationMessagesBucket>;
  messageStatusMap: Record<string, MessageLocalStatus>;
  pendingByClientMsgId: Record<string, PendingMessage>;

  // Legacy fields kept temporarily so existing components continue to work.
  messages: LegacyMessages;
  activeChat: ActiveChat;
  loading: boolean;
  error: string | null;
};

const EMPTY_ACTIVE_CHAT = {} as ActiveChat;
const EMPTY_MESSAGE_LIST: Message[] = [];

const serializeTs = (value: Message["ts"]): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
};

const toSerializableMessage = (message: Message): Message => ({
  ...message,
  ts: serializeTs(message.ts),
});

const toSerializableConversation = (conversation: ConversationListItem): ConversationListItem => ({
  ...conversation,
  lastMessage: conversation.lastMessage ? toSerializableMessage(conversation.lastMessage) : conversation.lastMessage,
});

const createEmptyBucket = (): ConversationMessagesBucket => ({
  ids: [],
  entities: {},
  nextCursor: null,
  hasMore: true,
  isInitialLoading: false,
  isFetchingOlder: false,
  error: null,
});

const getMessageKey = (message: Message): string => {
  return (
    message._id ??
    message.msgId ??
    message.clientMsgId ??
    `${message.sender}-${String(message.ts)}-${Math.random().toString(36).slice(2)}`
  );
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
  ) {
    return String((error as { response?: { data?: { message?: string } } }).response?.data?.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const getHttpStatus = (error: unknown): number | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: unknown } }).response?.status === "number"
  ) {
    return (error as { response?: { status?: number } }).response?.status ?? null;
  }

  return null;
};

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const readNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const unwrapApiData = (value: unknown): unknown => {
  const root = asRecord(value);
  if (!root) return value;

  if ("data" in root) {
    return root.data;
  }

  return value;
};

const normalizeLastMessage = (value: unknown, conversationId: string): Message | undefined => {
  const message = asRecord(value);
  if (!message) return undefined;

  const rawType = readString(message.type);
  const type: Message["type"] =
    rawType === "image" || rawType === "video" || rawType === "document" || rawType === "text"
      ? rawType
      : "text";

  return {
    _id: readString(message._id) ?? readString(message.messageId),
    msgId: readString(message.msgId),
    clientMsgId: readString(message.clientMsgId),
    conversationId,
    chatId: conversationId,
    sender: readString(message.sender) ?? readString(message.senderId) ?? "",
    receiver: readString(message.receiver),
    text: readString(message.text) ?? "",
    status: undefined,
    ts: readString(message.ts) ?? readString(message.createdAt) ?? new Date().toISOString(),
    type,
  };
};

const normalizeConversationItem = (value: unknown): ConversationListItem | null => {
  const conversation = asRecord(value);
  if (!conversation) return null;

  const peer = asRecord(conversation.peer);

  const conversationId = readString(conversation._id) ?? readString(conversation.conversationId);
  if (!conversationId) return null;

  const name =
    readString(conversation.name) ??
    readString(peer?.displayName) ??
    readString(peer?.name) ??
    readString(peer?.email);

  const updatedAt =
    readString(conversation.updatedAt) ??
    readString(conversation.lastMessageAt) ??
    readString(asRecord(conversation.lastMessage)?.createdAt);

  return {
    _id: conversationId,
    participantId: readString(conversation.participantId) ?? readString(peer?._id),
    name,
    title: readString(conversation.title) ?? name,
    avatar: readString(conversation.avatar) ?? readString(peer?.avatarUrl),
    chat: readString(conversation.chat) ?? readString(conversation.type) ?? "direct",
    isGroup:
      typeof conversation.isGroup === "boolean"
        ? conversation.isGroup
        : readString(conversation.type) === "group",
    unreadCount: readNumber(conversation.unreadCount) ?? 0,
    lastMessage: normalizeLastMessage(conversation.lastMessage, conversationId),
    updatedAt,
  };
};

const pickFirstArray = <T>(...values: unknown[]): T[] => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};

const extractConversationsPage = (value: unknown) => {
  const unwrapped = unwrapApiData(value);
  const data = unwrapped as Record<string, unknown> | unknown[];

  if (Array.isArray(data)) {
    return {
      items: (data as unknown[])
        .map(normalizeConversationItem)
        .filter((item): item is ConversationListItem => Boolean(item)),
      nextCursor: null,
      hasMore: false,
    };
  }

  const rawItems = pickFirstArray<unknown>(
    data?.items,
    data?.conversations,
    data?.results,
    data?.data
  );

  const items = rawItems
    .map(normalizeConversationItem)
    .filter((item): item is ConversationListItem => Boolean(item));

  return {
    items,
    nextCursor: (data?.nextCursor as string | null | undefined) ?? null,
    hasMore: Boolean(data?.hasMore ?? data?.nextCursor),
  };
};

const extractMessagesPage = (value: unknown) => {
  const unwrapped = unwrapApiData(value);
  const data = unwrapped as Record<string, unknown> | unknown[];

  if (Array.isArray(data)) {
    return {
      items: data as Message[],
      nextCursor: null,
      hasMore: false,
    };
  }

  const items = pickFirstArray<Message>(
    data?.items,
    data?.messages,
    data?.results,
    data?.data
  );

  return {
    items,
    nextCursor: (data?.nextCursor as string | null | undefined) ?? null,
    hasMore: Boolean(data?.hasMore ?? data?.nextCursor),
  };
};

const ensureBucket = (state: ChatState, conversationId: string): ConversationMessagesBucket => {
  state.messagesByConversationId[conversationId] ??= createEmptyBucket();
  return state.messagesByConversationId[conversationId];
};

const syncLegacyMessagesForConversation = (state: ChatState, conversationId: string) => {
  const bucket = state.messagesByConversationId[conversationId];
  if (!bucket) {
    state.messages[conversationId] = [];
    return;
  }

  state.messages[conversationId] = bucket.ids.map((id) => bucket.entities[id]).filter(Boolean);
};

const upsertMessageToBucket = (
  state: ChatState,
  conversationId: string,
  message: Message,
  mode: "append" | "prepend" = "append"
) => {
  const bucket = ensureBucket(state, conversationId);
  const normalizedMessage = toSerializableMessage(message);
  const incomingKey = getMessageKey(normalizedMessage);

  const existingId = bucket.ids.find((id) => {
    const current = bucket.entities[id];
    return (
      current?._id === normalizedMessage._id ||
      current?.msgId === normalizedMessage.msgId ||
      current?.clientMsgId === normalizedMessage.clientMsgId
    );
  });

  if (existingId) {
    bucket.entities[existingId] = { ...bucket.entities[existingId], ...normalizedMessage };
    return;
  }

  bucket.entities[incomingKey] = normalizedMessage;
  if (mode === "prepend") {
    bucket.ids.unshift(incomingKey);
  } else {
    bucket.ids.push(incomingKey);
  }
};

const resolveConversationId = (
  message: Message,
  payload?: { userId?: string; chatId?: string; conversationId?: string }
) => {
  if (payload?.conversationId) return payload.conversationId;
  if (payload?.chatId) return payload.chatId;
  if (message.conversationId) return message.conversationId;
  if (message.group) return message.group;
  if (message.chatId) return message.chatId;
  if (payload?.userId) {
    return message.sender === payload.userId ? message.receiver ?? message.sender : message.sender;
  }

  return message.receiver ?? message.sender;
};

const sortConversationIds = (state: ChatState) => {
  state.conversationIds.sort((a, b) => {
    const aConversation = state.conversationsById[a];
    const bConversation = state.conversationsById[b];

    const aTs =
      (aConversation?.updatedAt && new Date(aConversation.updatedAt).getTime()) ||
      (aConversation?.lastMessage?.ts ? new Date(aConversation.lastMessage.ts).getTime() : 0);

    const bTs =
      (bConversation?.updatedAt && new Date(bConversation.updatedAt).getTime()) ||
      (bConversation?.lastMessage?.ts ? new Date(bConversation.lastMessage.ts).getTime() : 0);

    return bTs - aTs;
  });
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (args: { cursor?: string; limit?: number } | undefined, thunkAPI) => {
    try {
      const res = await listConversationsAPI(args ?? {});
      const page = extractConversationsPage(res.data);

      // Compatibility fallback for users that still rely on auth.user.Chats.
      if (!args?.cursor && page.items.length === 0) {
        const state = thunkAPI.getState() as RootState;
        const legacyChats = Array.isArray(state.auth.user?.Chats) ? state.auth.user.Chats : [];

        if (legacyChats.length > 0) {
          const items: ConversationListItem[] = legacyChats.map((chat) => ({
            _id: chat._id,
            participantId: chat._id,
            name: chat.name,
            title: chat.name,
            avatar: undefined,
            chat: "direct",
            isGroup: false,
            unreadCount: 0,
          }));

          return {
            items,
            nextCursor: null,
            hasMore: false,
            append: false,
          };
        }
      }

      return {
        ...page,
        append: Boolean(args?.cursor),
      };
    } catch (error) {
      const status = getHttpStatus(error);

      // Compatibility fallback for backends that still expose legacy chat lists via auth.user.Chats.
      if (status === 404) {
        const state = thunkAPI.getState() as RootState;
        const legacyChats = Array.isArray(state.auth.user?.Chats) ? state.auth.user.Chats : [];

        const items: ConversationListItem[] = legacyChats.map((chat) => ({
          _id: chat._id,
          participantId: chat._id,
          name: chat.name,
          title: chat.name,
          avatar: undefined,
          chat: "direct",
          isGroup: false,
          unreadCount: 0,
        }));

        return {
          items,
          nextCursor: null,
          hasMore: false,
          append: false,
        };
      }

      return thunkAPI.rejectWithValue(extractErrorMessage(error, "Failed to fetch conversations"));
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  "chat/fetchConversationMessages",
  async (
    args: { conversationId: string; cursor?: string; limit?: number; mode?: "initial" | "older" },
    thunkAPI
  ) => {
    try {
      const { conversationId, cursor, limit = 30, mode = "initial" } = args;
      const res = await getConversationMessagesAPI(conversationId, { cursor, limit });
      const page = extractMessagesPage(res.data);

      return {
        conversationId,
        messages: page.items,
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
        mode,
      };
    } catch (error) {
      const status = getHttpStatus(error);
      if (status === 404) {
        try {
          const legacyRes = await groupMessageAPI(args.conversationId);
          const legacyMessages = toArray<Message>(legacyRes.data);

          return {
            conversationId: args.conversationId,
            messages: legacyMessages,
            nextCursor: null,
            hasMore: false,
            mode: args.mode ?? "initial",
          };
        } catch (legacyError) {
          return thunkAPI.rejectWithValue(
            extractErrorMessage(legacyError, "Failed to fetch messages")
          );
        }
      }

      return thunkAPI.rejectWithValue(extractErrorMessage(error, "Failed to fetch messages"));
    }
  }
);

export const updateConversationMessageStatus = createAsyncThunk(
  "chat/updateConversationMessageStatus",
  async (payload: MessageStatusPayload, thunkAPI) => {
    try {
      const res = await patchMessageStatusAPI(payload);
      return {
        payload,
        serverMessage: res.message,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error, "Failed to update message status"));
    }
  }
);

// Legacy thunks kept while UI migrates.
export const getMessage = createAsyncThunk<any, string>("chat/getMessage", async (peerId, thunkAPI) => {
  try {
    const res = await messageAPI(peerId);
    const messages = toArray<Message>(res.data);
    return { chatId: peerId, data: messages };
  } catch (error) {
    return thunkAPI.rejectWithValue(extractErrorMessage(error, "Get message error"));
  }
});

export const getGroupMessage = createAsyncThunk<any, string>(
  "chat/getGroupMessage",
  async (groupId, thunkAPI) => {
    try {
      const res = await groupMessageAPI(groupId);
      const messages = toArray<Message>(res.data);
      return { chatId: groupId, data: messages };
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error, "Get group message error"));
    }
  }
);

export const updateMessageStatus = createAsyncThunk("chat/updateStatus", async (peerId: string, thunkAPI) => {
  try {
    const res = await updateMessageStatusAPI(peerId);
    return res.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractErrorMessage(error, "update message status error"));
  }
});

export const deleteOneMessage = createAsyncThunk("chat/deleteOne", async (msgId: string, thunkAPI) => {
  try {
    const res = await deleteOneMessageAPI(msgId);
    return res.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractErrorMessage(error, "delete message error"));
  }
});

export const deleteAllMessage = createAsyncThunk("chat/deleteAll", async (chatId: string, thunkAPI) => {
  try {
    const res = await deleteAllMessageAPI(chatId);
    return res.message;
  } catch (error) {
    return thunkAPI.rejectWithValue(extractErrorMessage(error, "delete all messages error"));
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversationsById: {},
    conversationIds: [],
    activeConversationId: null,
    conversationListCursor: null,
    hasMoreConversations: true,
    isConversationsLoading: false,
    conversationListError: null,
    messagesByConversationId: {},
    messageStatusMap: {},
    pendingByClientMsgId: {},

    messages: {},
    activeChat: EMPTY_ACTIVE_CHAT,
    loading: false,
    error: null,
  } as ChatState,

  reducers: {
    upsertConversations: (state, action: PayloadAction<ConversationListItem[]>) => {
      for (const conversation of action.payload) {
        const normalizedConversation = toSerializableConversation(conversation);
        state.conversationsById[normalizedConversation._id] = {
          ...state.conversationsById[normalizedConversation._id],
          ...normalizedConversation,
        };

        if (!state.conversationIds.includes(normalizedConversation._id)) {
          state.conversationIds.push(normalizedConversation._id);
        }
      }

      sortConversationIds(state);
    },

    setActiveConversationId: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },

    addMessage: (
      state,
      action: PayloadAction<{ message: Message; userId?: string; chatId?: string; conversationId?: string }>
    ) => {
      const { message, userId, chatId, conversationId } = action.payload;
      const resolvedConversationId = resolveConversationId(message, { userId, chatId, conversationId });

      upsertMessageToBucket(state, resolvedConversationId, {
        ...message,
        conversationId: message.conversationId ?? resolvedConversationId,
      });
      syncLegacyMessagesForConversation(state, resolvedConversationId);

      state.conversationsById[resolvedConversationId] = {
        ...state.conversationsById[resolvedConversationId],
        _id: resolvedConversationId,
        lastMessage: toSerializableMessage(message),
        updatedAt: new Date().toISOString(),
        unreadCount:
          state.activeConversationId === resolvedConversationId || message.sender === userId
            ? state.conversationsById[resolvedConversationId]?.unreadCount ?? 0
            : (state.conversationsById[resolvedConversationId]?.unreadCount ?? 0) + 1,
      };

      if (!state.conversationIds.includes(resolvedConversationId)) {
        state.conversationIds.push(resolvedConversationId);
      }

      sortConversationIds(state);

      const messageKey = message._id ?? message.msgId ?? message.clientMsgId;
      if (messageKey && (message.localStatus || message.status)) {
        state.messageStatusMap[messageKey] = (message.localStatus ?? message.status ?? "sent") as MessageLocalStatus;
      }
    },

    addOptimisticMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const clientMsgId = message.clientMsgId ?? message.msgId;

      upsertMessageToBucket(state, conversationId, {
        ...message,
        conversationId,
        localStatus: message.localStatus ?? "sending",
      });
      syncLegacyMessagesForConversation(state, conversationId);

      state.conversationsById[conversationId] = {
        ...state.conversationsById[conversationId],
        _id: conversationId,
        lastMessage: toSerializableMessage(message),
        updatedAt: new Date().toISOString(),
      };

      if (!state.conversationIds.includes(conversationId)) {
        state.conversationIds.push(conversationId);
      }

      sortConversationIds(state);

      if (clientMsgId) {
        state.pendingByClientMsgId[clientMsgId] = {
          conversationId,
          createdAt: Date.now(),
        };
        state.messageStatusMap[clientMsgId] = "sending";
      }
    },

    reconcileMessageSentAck: (
      state,
      action: PayloadAction<{ clientMsgId: string; message: Message; conversationId?: string }>
    ) => {
      const { clientMsgId, message } = action.payload;
      const conversationId =
        action.payload.conversationId ?? state.pendingByClientMsgId[clientMsgId]?.conversationId ?? message.conversationId;

      if (!conversationId) return;

      const bucket = ensureBucket(state, conversationId);
      const existingId = bucket.ids.find((id) => bucket.entities[id]?.clientMsgId === clientMsgId);
      const serverKey = message._id ?? message.msgId ?? clientMsgId;

      if (existingId) {
        const merged = {
          ...bucket.entities[existingId],
          ...message,
          localStatus: "sent" as const,
          status: message.status ?? "sent",
        };

        if (serverKey !== existingId) {
          delete bucket.entities[existingId];
          bucket.entities[serverKey] = merged;
          const index = bucket.ids.findIndex((id) => id === existingId);
          if (index !== -1) {
            bucket.ids[index] = serverKey;
          }
        } else {
          bucket.entities[existingId] = merged;
        }
      } else {
        upsertMessageToBucket(state, conversationId, {
          ...message,
          localStatus: "sent",
          status: message.status ?? "sent",
        });
      }

      syncLegacyMessagesForConversation(state, conversationId);
      delete state.pendingByClientMsgId[clientMsgId];
      state.messageStatusMap[serverKey] = message.status ?? "sent";
    },

    markMessageFailed: (state, action: PayloadAction<{ clientMsgId: string; errorReason?: string }>) => {
      const { clientMsgId, errorReason } = action.payload;
      const pending = state.pendingByClientMsgId[clientMsgId];
      if (!pending) return;

      const bucket = ensureBucket(state, pending.conversationId);
      const existingId = bucket.ids.find((id) => bucket.entities[id]?.clientMsgId === clientMsgId);

      if (existingId) {
        bucket.entities[existingId] = {
          ...bucket.entities[existingId],
          localStatus: "failed",
          errorReason,
        };
      }

      state.pendingByClientMsgId[clientMsgId] = {
        ...pending,
        errorReason,
      };
      state.messageStatusMap[clientMsgId] = "failed";
      syncLegacyMessagesForConversation(state, pending.conversationId);
    },

    patchMessageStatus: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId?: string;
        clientMsgId?: string;
        status: "sent" | "delivered" | "read";
      }>
    ) => {
      const { conversationId, messageId, clientMsgId, status } = action.payload;
      const bucket = state.messagesByConversationId[conversationId];
      if (!bucket) return;

      const targetId = bucket.ids.find((id) => {
        const message = bucket.entities[id];
        return (
          message?._id === messageId ||
          message?.msgId === messageId ||
          message?.clientMsgId === clientMsgId
        );
      });

      if (targetId) {
        bucket.entities[targetId] = {
          ...bucket.entities[targetId],
          status,
          localStatus: status,
        };

        const messageKey = bucket.entities[targetId]._id ?? bucket.entities[targetId].msgId ?? bucket.entities[targetId].clientMsgId;
        if (messageKey) {
          state.messageStatusMap[messageKey] = status;
        }
      }

      syncLegacyMessagesForConversation(state, conversationId);
    },

    prependOlderMessages: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: Message[];
        nextCursor?: string | null;
        hasMore?: boolean;
      }>
    ) => {
      const { conversationId, messages, nextCursor, hasMore } = action.payload;
      const bucket = ensureBucket(state, conversationId);

      for (let index = messages.length - 1; index >= 0; index--) {
        const message = messages[index];
        upsertMessageToBucket(state, conversationId, {
          ...message,
          conversationId: message.conversationId ?? conversationId,
        }, "prepend");
      }

      bucket.nextCursor = nextCursor ?? bucket.nextCursor;
      bucket.hasMore = hasMore ?? bucket.hasMore;
      bucket.isFetchingOlder = false;
      bucket.error = null;
      syncLegacyMessagesForConversation(state, conversationId);
    },

    deleteAllMessageReducer: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      if (!chatId) return;

      state.messages[chatId] = [];
      if (state.messagesByConversationId[chatId]) {
        state.messagesByConversationId[chatId] = createEmptyBucket();
      }
    },

    deleteOneMessageReducer: (state, action: PayloadAction<{ chatId: string; msgId: string }>) => {
      const { chatId, msgId } = action.payload;
      if (!chatId || !msgId) return;

      const bucket = state.messagesByConversationId[chatId];
      if (bucket) {
        const targetId = bucket.ids.find((id) => {
          const message = bucket.entities[id];
          return message?._id === msgId || message?.msgId === msgId || message?.clientMsgId === msgId;
        });

        if (targetId) {
          delete bucket.entities[targetId];
          bucket.ids = bucket.ids.filter((id) => id !== targetId);
        }
      }

      state.messages[chatId] = (state.messages[chatId] ?? []).filter((message) => {
        return message._id !== msgId && message.msgId !== msgId && message.clientMsgId !== msgId;
      });
    },

    setActiveChat: (state, action: PayloadAction<ActiveChat>) => {
      state.activeChat = {
        ...action.payload,
        chat: action.payload.chat ?? "direct",
        participantId: action.payload.participantId,
      };
      state.activeConversationId = action.payload._id;

      if (action.payload._id) {
        state.conversationsById[action.payload._id] = {
          ...state.conversationsById[action.payload._id],
          _id: action.payload._id,
          name: action.payload.title,
          title: action.payload.title,
          avatar: action.payload.avatar,
          chat: action.payload.chat,
        };

        if (!state.conversationIds.includes(action.payload._id)) {
          state.conversationIds.push(action.payload._id);
        }
      }
    },

    clearActiveChat: (state) => {
      state.activeChat = EMPTY_ACTIVE_CHAT;
      state.activeConversationId = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isConversationsLoading = true;
        state.conversationListError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const { items, nextCursor, hasMore } = action.payload;

        for (const conversation of items) {
          const normalizedConversation = toSerializableConversation(conversation);
          state.conversationsById[normalizedConversation._id] = {
            ...state.conversationsById[normalizedConversation._id],
            ...normalizedConversation,
          };

          if (!state.conversationIds.includes(normalizedConversation._id)) {
            state.conversationIds.push(normalizedConversation._id);
          }
        }

        sortConversationIds(state);
        state.conversationListCursor = nextCursor;
        state.hasMoreConversations = hasMore;
        state.isConversationsLoading = false;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isConversationsLoading = false;
        state.conversationListError = (action.payload as string) || "Failed to fetch conversations";
      })
      .addCase(fetchConversationMessages.pending, (state, action) => {
        const { conversationId, mode = "initial" } = action.meta.arg;
        const bucket = ensureBucket(state, conversationId);

        if (mode === "older") {
          bucket.isFetchingOlder = true;
        } else {
          bucket.isInitialLoading = true;
        }

        bucket.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        const { conversationId, messages, nextCursor, hasMore, mode } = action.payload;
        const bucket = ensureBucket(state, conversationId);

        if (mode === "older") {
          for (let index = messages.length - 1; index >= 0; index--) {
            const message = messages[index];
            upsertMessageToBucket(state, conversationId, {
              ...message,
              conversationId: message.conversationId ?? conversationId,
            }, "prepend");
          }
          bucket.isFetchingOlder = false;
        } else {
          bucket.ids = [];
          bucket.entities = {};
          for (const message of messages) {
            upsertMessageToBucket(state, conversationId, {
              ...message,
              conversationId: message.conversationId ?? conversationId,
            });
          }
          bucket.isInitialLoading = false;
        }

        bucket.nextCursor = nextCursor;
        bucket.hasMore = hasMore;
        bucket.error = null;

        syncLegacyMessagesForConversation(state, conversationId);

        const latestMessage = state.messages[conversationId]?.[state.messages[conversationId].length - 1];
        if (latestMessage) {
          state.conversationsById[conversationId] = {
            ...state.conversationsById[conversationId],
            _id: conversationId,
            lastMessage: latestMessage,
            updatedAt: new Date(latestMessage.ts).toISOString(),
          };

          if (!state.conversationIds.includes(conversationId)) {
            state.conversationIds.push(conversationId);
          }
          sortConversationIds(state);
        }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        const { conversationId, mode = "initial" } = action.meta.arg;
        const bucket = ensureBucket(state, conversationId);

        if (mode === "older") {
          bucket.isFetchingOlder = false;
        } else {
          bucket.isInitialLoading = false;
        }

        bucket.error = (action.payload as string) || "Failed to fetch messages";
      })
      .addCase(updateConversationMessageStatus.fulfilled, (state, action) => {
        const payload = action.payload.payload;
        const targetMessageId = payload.messageId ?? payload.readUptoMessageId;

        if (targetMessageId) {
          state.messageStatusMap[targetMessageId] = payload.status;
        }
      })

      // Legacy extra reducers below.
      .addCase(getMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessage.fulfilled, (state, action) => {
        const { chatId, data } = action.payload;
        const bucket = ensureBucket(state, chatId);
        bucket.ids = [];
        bucket.entities = {};

        for (const message of data) {
          upsertMessageToBucket(state, chatId, {
            ...message,
            conversationId: message.conversationId ?? chatId,
          });
        }

        syncLegacyMessagesForConversation(state, chatId);
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
        const bucket = ensureBucket(state, chatId);
        bucket.ids = [];
        bucket.entities = {};

        for (const message of data) {
          upsertMessageToBucket(state, chatId, {
            ...message,
            conversationId: message.conversationId ?? chatId,
          });
        }

        syncLegacyMessagesForConversation(state, chatId);
        state.loading = false;
      })
      .addCase(getGroupMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to get group messages";
      });
  },
});

export const {
  addMessage,
  addOptimisticMessage,
  clearActiveChat,
  deleteAllMessageReducer,
  deleteOneMessageReducer,
  markMessageFailed,
  patchMessageStatus,
  prependOlderMessages,
  reconcileMessageSentAck,
  setActiveChat,
  setActiveConversationId,
  upsertConversations,
} = chatSlice.actions;

const selectChatState = (state: RootState) => state.chat;

export const selectConversations = createSelector(selectChatState, (chat) =>
  chat.conversationIds.map((conversationId) => chat.conversationsById[conversationId]).filter(Boolean)
);

export const selectIsConversationsLoading = createSelector(selectChatState, (chat) =>
  chat.isConversationsLoading
);

export const selectActiveConversation = createSelector(selectChatState, (chat) => {
  if (!chat.activeConversationId) return null;
  return chat.conversationsById[chat.activeConversationId] ?? null;
});

export const selectActiveConversationId = createSelector(selectChatState, (chat) =>
  chat.activeConversationId ?? chat.activeChat?._id ?? null
);

export const selectLegacyActiveChat = createSelector(selectChatState, (chat) => chat.activeChat);

export const selectConversationBucketById = (conversationId: string | null | undefined) =>
  createSelector(selectChatState, (chat) => {
    if (!conversationId) return undefined;
    return chat.messagesByConversationId[conversationId];
  });

export const selectMessagesForConversation = (conversationId: string) =>
  createSelector(selectChatState, (chat) => {
    const messages = chat.messages[conversationId];
    return messages ?? EMPTY_MESSAGE_LIST;
  });

export const selectActiveConversationMessages = createSelector(selectChatState, (chat) => {
  if (!chat.activeConversationId) return EMPTY_MESSAGE_LIST;
  return chat.messages[chat.activeConversationId] ?? EMPTY_MESSAGE_LIST;
});

export const selectTotalUnreadCount = createSelector(selectConversations, (conversations) =>
  conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0)
);

export default chatSlice.reducer;
