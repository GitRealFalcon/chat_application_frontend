import { Outlet } from "react-router-dom";
import {
  initSocket,
  disconnectSocket,
  injectSocketStore,
} from "./services/socket/socket";
import { registerSocketListener } from "./services/socket/socketListeners";
import { useAppDispatch, useAppSelector } from "./App/hooks";
import { useEffect } from "react";
import { getUser } from "./features/auth/authSlice";
import { getOnlineUser } from "./features/user/userSlice";
import {
  injectSocketLifecycleStore,
  useSocketLifecycle,
} from "./services/socket/useSocketLifecycle";
import store from "./App/store";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

// 🔥 inject store once
injectSocketStore(store);
injectSocketLifecycleStore(store);

function App() {
  const { isAuthenticated, authChecked } = useAppSelector(
    (state) => state.auth
  );

  const dispatch = useAppDispatch();

  useSocketLifecycle();

  useEffect(() => {
    if (!authChecked) {
      dispatch(getUser());
    }
  }, [authChecked, dispatch]);

  useEffect(() => {
    if (isAuthenticated && authChecked) {
      console.log("🔥 Init socket from App");

      const socket = initSocket();

      if (socket) {
        registerSocketListener(socket);
      }

      dispatch(getOnlineUser());
    }

    if (!isAuthenticated && authChecked) {
      disconnectSocket();
    }
  }, [isAuthenticated, authChecked, dispatch]);

  return <div>
    <Outlet />;
    <SpeedInsights />
    <Analytics />
  </div>
}

export default App;