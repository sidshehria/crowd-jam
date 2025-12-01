"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const updateStatus = () => {
      setIsConnected(socket.connected);
    };

    updateStatus();
    socket.on("connect", updateStatus);
    socket.on("disconnect", updateStatus);

    return () => {
      socket.off("connect", updateStatus);
      socket.off("disconnect", updateStatus);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <span className={isConnected ? "text-green-600" : "text-red-600"}>
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

