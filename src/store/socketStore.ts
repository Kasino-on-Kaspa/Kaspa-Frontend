import { getStoredTokens } from "@/lib/auth";
import {
  SocketState,
  SocketConfig,
  ConnectionState,
  ServerToClientEvents,
} from "@/types/socket";
import { io } from "socket.io-client";
import { create } from "zustand";
import useWalletStore from "./walletStore";
import useLogStore from "./logStore";
import { toast } from "sonner";

const DEFAULT_CONFIG: SocketConfig = {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};

const INITIAL_CONNECTION_STATE: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastConnectedAt: null,
  reconnectAttempts: 0,
};

const useSocketStore = create<SocketState>((set, get) => ({
  ...INITIAL_CONNECTION_STATE,
  socket: null,
  config: DEFAULT_CONFIG,
  eventHandlers: {},

  // State setters
  setIsConnected: (isConnected: boolean) => set({ isConnected }),
  setConnectionError: (error: string | null) => set({ connectionError: error }),
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setLastConnectedAt: (timestamp: number | null) =>
    set({ lastConnectedAt: timestamp }),
  setReconnectAttempts: (attempts: number) =>
    set({ reconnectAttempts: attempts }),

  // Event handler management
  registerEventHandler: (event, handler) => {
    const socket = get().socket;
    if (!socket) return;

    set((state) => ({
      eventHandlers: {
        ...state.eventHandlers,
        [event]: handler,
      },
    }));

    socket.on(event, handler as any); // Type assertion needed due to complex event handler types
  },

  unregisterEventHandler: (event) => {
    const socket = get().socket;
    if (!socket) return;

    set((state) => {
      const { [event]: _, ...rest } = state.eventHandlers;
      return { eventHandlers: rest };
    });

    socket.off(event);
  },

  // Connection management
  reconnect: () => {
    const { socket, config, reconnectAttempts } = get();
    if (!socket) return;

    // Remove all event listeners before reconnecting
    socket.removeAllListeners();

    if (reconnectAttempts >= config.reconnectionAttempts) {
      set({
        connectionError: "Maximum reconnection attempts reached",
        isConnecting: false,
      });
      return;
    }

    set({ isConnecting: true, connectionError: null });
    socket.connect();
  },

  connect: () => {
    const authTokens = getStoredTokens();
    const walletStore = useWalletStore.getState();
    const { config } = get();

    if (!authTokens) {
      set({
        isConnected: false,
        isConnecting: false,
        connectionError: "Auth Token Not Found",
      });
      throw new Error("Auth Token Not Found");
    }

    if (!walletStore.isAuthenticated) {
      set({
        isConnected: false,
        isConnecting: false,
        connectionError: "User Not Authenticated",
      });
      throw new Error("User Not Authenticated");
    }

    set({ isConnecting: true, connectionError: null });

    // Clean up existing socket if any
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: authTokens.accessToken,
      },
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      forceNew: true, // Force a new connection
      ...config,
    });

    if (socket) {
      // Core connection events
      socket.on("connect", () => {
        console.log("Connected to socket");
        set({
          isConnected: true,
          isConnecting: false,
          connectionError: null,
          lastConnectedAt: Date.now(),
          reconnectAttempts: 0,
        });
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket");
        set({ isConnected: false });
      });

      socket.on("connect_error", (error) => {
        if (error.message === "Invalid token") {
          walletStore.checkAuthExpiry();
        }
        set((state) => ({
          isConnected: false,
          isConnecting: false,
          connectionError: error.message,
          reconnectAttempts: state.reconnectAttempts + 1,
        }));
        console.error("Socket connection error:", error);
        toast.error("Failed to connect to socket");
      });

      socket.on("disconnecting", () => {
        console.log("Disconnecting from socket");
        set({ isConnected: false });
      });

      // Reconnection events
      socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
        set({ reconnectAttempts: attemptNumber });
      });

      socket.on("reconnect_error", (error) => {
        console.error("Reconnection error:", error);
      });

      socket.on("reconnect_failed", () => {
        set({
          connectionError: "Failed to reconnect",
          isConnecting: false,
        });
      });

      // Only register log:new event if it's not already registered
      if (!socket.hasListeners("log:new")) {
        socket.on("log:new", (data) => {
          console.log("Received log:new event");
          useLogStore.getState().addLog(data);
        });
      }
    }

    set({ socket });

    try {
      socket.connect();
      walletStore.initializeWalletSocketListeners();
    } catch (error) {
      set({
        isConnected: false,
        isConnecting: false,
        connectionError:
          error instanceof Error ? error.message : "Socket connection error",
      });
      console.error("Socket connection error:", error);
    }
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      // Remove all event listeners
      socket.removeAllListeners();
      socket.disconnect();
      get().cleanup();
    }
  },

  cleanup: () => {
    const socket = get().socket;
    if (!socket) return;

    // First remove all registered event handlers
    Object.keys(get().eventHandlers).forEach((event) => {
      socket.off(event as keyof ServerToClientEvents);
    });

    // Then remove all listeners including internal ones
    socket.removeAllListeners();

    // Close the socket connection
    socket.close();

    // Reset the store state
    set({
      socket: null,
      ...INITIAL_CONNECTION_STATE,
      eventHandlers: {},
    });

    console.log("Socket cleanup completed");
  },
}));

export default useSocketStore;
