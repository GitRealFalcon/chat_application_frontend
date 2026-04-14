import { io } from "socket.io-client";

let socket = null

export const initSocket = ()=>{
        socket = io(import.meta.env.VITE_API_SOCKET_URL,{
            withCredentials:true,
            transports:["websocket"],
            autoConnect:true
        })

        return socket
}

export const getSocket = ()=> socket;

export const disconnectSocket = ()=>{
    if (socket) {
        socket.disconnect();
        socket = null
    }
}