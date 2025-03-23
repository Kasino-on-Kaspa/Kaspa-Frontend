import {
  CoinFlipClientMessage,
  CoinflipStore,
  TCoinflipSessionJSON,
} from "@/types/coinflip";
import { create } from "zustand";
import useSocketStore from "./socketStore";
import { getStoredTokens } from "@/lib/auth";

const useCoinflipStore = create<CoinflipStore>((set, get) => ({
  isConnected: false,
  sessionData: null,
  serverSeed: null,
  gameSessionError: null,
  serverSeedHash: null,
  initializeGame: () => {
    try {
      const coinflipSocket = useSocketStore.getState().socket;

      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        throw new Error("No access token available");
      }

      if (!coinflipSocket) {
        throw new Error("Coinflip socket not found");
      }

      const coinflipState = get();
      coinflipState.initializeListeners();

      if (!coinflipState.sessionData) {
        coinflipState.startSession();
      }
    } catch (error) {
      console.error(error);
      set({ gameSessionError: error as string });
    }
  },
  startSession: () => {
    try {
      const coinflipSocket = useSocketStore.getState().socket;

      if (coinflipSocket?.connected) {
        console.log("Requesting Coinflip Session...");
        coinflipSocket.emit(
          CoinFlipClientMessage.GET_SESSION,
          (serverSeedHash: string, sessionData?: TCoinflipSessionJSON) => {
            set({
              serverSeedHash,
              sessionData,
              isConnected: true,
            });
          },
        );
      }
    } catch (error) {
      console.error(error);
      set({ gameSessionError: error as string });
    }
  },
  initializeListeners: () => {},
  sessionCleanup: () => {},
  getSessionSeed: () => {},
  createBet: () => {},
  flipCoin: () => {},
  continueBet: () => {},
  sessionNext: () => {},
}));
export default useCoinflipStore;
