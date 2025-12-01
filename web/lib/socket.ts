import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(serverUrl?: string): Socket {
  // Use environment variable if available, otherwise fallback to localhost
  const url = serverUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  if (socket?.connected) {
    return socket;
  }

  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  socket = io(url, {
    transports: ["websocket", "polling"], // Fallback to polling if websocket fails
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

