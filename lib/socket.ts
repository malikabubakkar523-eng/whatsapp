"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("chatflow_token") : null;
    socket = io(typeof window !== "undefined" ? window.location.origin : "", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
      auth: token ? { token } : undefined,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
    });

    socket.on("connect", () => {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("chatflow_token") : null;
      if (currentToken) {
        socket?.emit("auth:identify", { token: currentToken });
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ [ChatFlow] Socket connection error:", err.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

