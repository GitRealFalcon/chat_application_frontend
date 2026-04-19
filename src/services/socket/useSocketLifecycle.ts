import { useEffect } from "react";
import { connectSocketIfNeeded, getSocket, initSocket } from "../socket/socket";
import { RootState } from "@/App/store";

let store: any = null;

export const injectSocketLifecycleStore = (_store: any) => {
  store = _store;
};

export const useSocketLifecycle = () => {
  useEffect(() => {
    const reconnectIfAllowed = () => {
      if (!store) {
        return;
      }

      const state = store.getState() as RootState;

      if (!state.auth.authChecked || !state.auth.isAuthenticated) {
        console.log("⛔ Auth not ready, skip reconnect");
        return;
      }

      let socket = getSocket();

      if (!socket) {
        console.log("♻️ Init socket on tab active");
        socket = initSocket();
      }

      if (socket && !socket.connected) {
        console.log("♻️ Reconnecting socket");
        connectSocketIfNeeded(socket);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        reconnectIfAllowed();
      }
    };

    const handleFocus = () => reconnectIfAllowed();
    const handleOnline = () => reconnectIfAllowed();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    reconnectIfAllowed();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
};