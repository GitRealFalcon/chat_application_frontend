import { io, Socket } from "socket.io-client";
import { RootState } from "@/App/store";

let socket: Socket | null = null;
let store: any = null;
let hasSocketSubscription = false;
let isConnecting = false;

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL;

export const injectSocketStore = (_store: any) => {
  store = _store;
};

const canConnectSocket = (state: RootState) => {
  return state.auth.authChecked && state.auth.isAuthenticated;
};

export const connectSocketIfNeeded = (nextSocket: Socket | null) => {
  if (!nextSocket) {
    return;
  }

  if (nextSocket.connected || isConnecting) {
    return;
  }

  isConnecting = true;
  nextSocket.connect();
};

// 🔁 Internal socket lifecycle handlers
const registerCoreEvents = (socket: Socket) => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");

  socket.on("connect", () => {
    isConnecting = false;
    console.log("✅ Connected:", socket.id);

    socket.emit("forceJoin");

    window.dispatchEvent(new Event("socket:connected"));
  });

  socket.on("disconnect", (reason) => {
    isConnecting = false;
    console.log("❌ Disconnected:", reason);
  });

  socket.on("connect_error", (err: any) => {
    isConnecting = false;
    console.log("⚠️ Socket error:", err.message);

    if (err.message === "UNAUTHORIZED") {
      window.location.href = "/login";
    }
  });
};

export const initSocket = () => {
  if (!store) {
    console.log("⛔ Store not injected");
    return null;
  }

  const state = store.getState();
  const isSocketAllowed = canConnectSocket(state);

  // ✅ Always create socket once
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    registerCoreEvents(socket);

    // 🔥 Auto-connect when auth becomes ready
    if (!hasSocketSubscription) {
      store.subscribe(() => {
        const nextState = store.getState();

        if (canConnectSocket(nextState) && socket && !socket.connected) {
          console.log("🚀 Auto connecting after auth ready");
          connectSocketIfNeeded(socket);
        }
      });

      hasSocketSubscription = true;
    }
  }

  // 🔥 connect immediately if ready
  if (isSocketAllowed && socket && !socket.connected) {
    console.log("🚀 Connecting socket...");
    connectSocketIfNeeded(socket);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    isConnecting = false;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const resetSocket = () => {
  disconnectSocket();
  return initSocket();
};