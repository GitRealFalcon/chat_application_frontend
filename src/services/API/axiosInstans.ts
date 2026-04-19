import axios, { AxiosResponse } from "axios";
import { logout, setAuthReady } from "../../features/auth/authSlice";
import { connectSocketIfNeeded, getSocket, initSocket } from "../socket/socket";
import { registerSocketListener } from "../socket/socketListeners";

let store: any = null;

export const injectStore = (_store: any) => {
  store = _store;
};

let refreshPromise: Promise<AxiosResponse> | null = null;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (message === "ACCESS_TOKEN_EXPIRED") {
        try {
          if (!refreshPromise) {
            refreshPromise = axiosInstance
              .post("/auth/refresh")
              .finally(() => (refreshPromise = null));
          }

          await refreshPromise;

          store.dispatch(setAuthReady(true));

          // Reuse current socket to avoid creating a second live connection.
          const socket = getSocket() ?? initSocket();
          if (socket) {
            registerSocketListener(socket);
            connectSocketIfNeeded(socket);
          }

          return axiosInstance(originalRequest);
        } catch (err) {
          store?.dispatch(logout());
          return Promise.reject(err);
        }
      }

      store?.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;