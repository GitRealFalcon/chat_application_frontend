import axios from "axios";
import { logout } from "../../features/auth/authSlice";

let store;

export const injectStore = (_store)=>{
    store = _store
}

const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_BASE_URL,
    withCredentials:true,
    timeout:15000
}) 

axiosInstance.interceptors.request.use(
  (config) => {
   
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;
    console.log(message);
    console.log(status);
    console.log(error);
    
    
    if (
      status === 401 &&
      message === "ACCESS_TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/auth/refresh");
        return axiosInstance(originalRequest); 
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance