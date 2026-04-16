import axios from "axios";
import { logout } from "../../features/auth/authSlice";
import type { AppDispatch } from "../../App/store";

type StoreLike = {
  dispatch: AppDispatch;
};

let store: StoreLike | null = null;

export const injectStore = (_store: StoreLike) => {
  store = _store;
};

let refreshPromise: Promise<void> | null = null;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (
      status === 401 &&
      message === "ACCESS_TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosInstance
            .post("/auth/refresh")
            .then(() => {})
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store?.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;