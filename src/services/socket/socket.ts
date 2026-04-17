import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.log("⚠️ Socket error:", err.message);

      if (err.message === "UNAUTHORIZED") {
        disconnectSocket();
        window.location.href = "/login";
      }

      if (err.message === "ACCESS_TOKEN_EXPIRED") {
        disconnectSocket();
      }
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const resetSocket = () => {
  disconnectSocket();
  return initSocket();
};