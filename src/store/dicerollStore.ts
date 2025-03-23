import { create } from "zustand";
import { z } from "zod";
import {
  DicerollStore,
  TDierollSessionJSON,
  DieRollBetType,
  TDieRollAck,
  TDieRollGameResult,
  DieRollServerMessage,
  DieRollClientMessage,
} from "@/types/dieroll";
import { getStoredTokens } from "@/lib/auth";
import useSocketStore from "./socketStore";
const useDicerollStore = create<DicerollStore>((set, get) => ({
  isConnected: false,
  sessionData: null,
  serverSeedHash: null,
  gameSessionError: null,
  rollResult: null,
  serverSeed: null,

  initializeGame() {
    const dierollSocket = useSocketStore.getState().socket;
    try {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        throw new Error("No access token available");
      }

      if (!dierollSocket) {
        throw new Error("No dieroll socket available");
      }

      const dicerollState = get();
      dicerollState.intializeListeners();
      if (!dicerollState.sessionData) {
        dicerollState.startSession();
      }
    } catch (error) {
      console.error("Error initializing dieroll socket:", error);
      set({ gameSessionError: "Failed to initialize game" });
    }
  },

  startSession() {
    const dierollSocket = useSocketStore.getState().socket;
    if (dierollSocket?.connected) {
      console.log("Requesting dieroll session...");
      dierollSocket.emit(
        DieRollClientMessage.GET_SESSION,
        (serverSeedHash: string, sessionData: TDierollSessionJSON) => {
          console.log("Received session data:", {
            serverSeedHash,
            sessionData,
          });
          set({ serverSeedHash, sessionData, isConnected: true });
        },
      );
    } else {
      console.error("Socket not connected when trying to start session");
      set({ gameSessionError: "Not connected to game server" });
    }
  },

  placeBet(betData: z.infer<typeof DieRollBetType>) {
    const dierollSocket = useSocketStore.getState().socket;
    if (dierollSocket?.connected) {
      console.log("Placing bet:", betData);
      dierollSocket.emit(
        DieRollClientMessage.PLACE_BET,
        betData,
        (ackStatus: TDieRollAck) => {
          console.log("Bet acknowledgment:", ackStatus);
          if (ackStatus.status === "SUCCESS") {
            set({ sessionData: ackStatus.session, gameSessionError: null });
          } else {
            set({ gameSessionError: ackStatus.message });
          }
        },
      );
    } else {
      console.error("Socket not connected when trying to place bet");
      set({ gameSessionError: "Not connected to game server" });
    }
  },

  intializeListeners() {
    const dierollSocket = useSocketStore.getState().socket;
    if (dierollSocket?.connected) {
      dierollSocket.on(
        DieRollServerMessage.ROLL_RESULT,
        (result: TDieRollGameResult) => {
          console.log("Roll result received:", result);
          set({ rollResult: result });
        },
      );

      dierollSocket.on(
        DieRollServerMessage.GAME_ENDED,
        ({ serverSeed }: { serverSeed: string }) => {
          console.log("Game ended:", serverSeed);
          set({ serverSeed: serverSeed });
        },
      );
    } else {
      console.error("Socket not connected when trying to initialize listeners");
    }
  },

  cleanup() {
    const dierollSocket = useSocketStore.getState().socket;
    if (dierollSocket) {
      dierollSocket.disconnect();
      set({
        sessionData: null,
        serverSeedHash: null,
        gameSessionError: null,
        rollResult: null,
      });
    }
  },
}));

export default useDicerollStore;
