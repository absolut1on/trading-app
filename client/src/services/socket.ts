import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, { autoConnect: false });
  }
  return socket;
}

export function connectSocket(userId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit("join", userId);
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
