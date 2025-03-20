import { getStoredTokens } from "@/lib/auth";
import { SocketState } from "@/types/socket";
import { io } from "socket.io-client";
import { create } from "zustand";
import useWalletStore from "./walletStore";

const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  connectionError: null,
  reconnect: () => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.connect();
    }
  },
  connect: () => {
    const authTokens = getStoredTokens();
    const walletStore = useWalletStore.getState();

    if (!authTokens) {
      set({
        isConnected: false,
        connectionError: "Auth Token Not Found",
      });
      throw new Error("Auth Token Not Found");
    }

    if (!walletStore.isAuthenticated) {
      set({
        isConnected: false,
        connectionError: "User Not Authenticated",
      });
      throw new Error("User Not Authenticated");
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: authTokens.accessToken,
      },
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to socket");
      });
      socket.on("disconnect", () => {
        console.log("Disconnected from socket");
      });
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socket.on("disconnecting", () => {
        console.log("Disconnecting from socket");
      });
    }

    set({ socket });

    try {
      socket.connect();
      walletStore.initializeWalletSocketListeners();
    } catch (error) {
      set({
        isConnected: false,
        connectionError: "Socket connection error",
      });
      console.error("Socket connection error:", error);
    }
  },
  disconnect: () => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.disconnect();
    }
  },
}));

export default useSocketStore;
