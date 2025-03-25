import {
  CoinFlipClientMessage,
  CoinFlipServerMessage,
  CoinflipStore,
  TCoinflipAck,
  TCoinflipSessionClientGameData,
  TCoinflipSessionJSON,
} from "@/types/coinflip";
import { create } from "zustand";
import useSocketStore from "./socketStore";
import { getStoredTokens } from "@/lib/auth";

const useCoinflipStore = create<CoinflipStore>((set, get) => ({
  isConnected: false,
  flipResult: null,
  sessionData: null,
  gameState: null,
  serverSeed: null,
  gameSessionError: null,
  serverSeedHash: null,
  initializeGame: () => {
    try {
      const coinflipSocket = useSocketStore.getState().socket;

      console.log("Coinflip socket:", coinflipSocket);

      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        throw new Error("No access token available");
      }

      if (!coinflipSocket) {
        throw new Error("Coinflip socket not found");
      }

      const coinflipState = get();
      coinflipState.initializeListeners();

      coinflipState.startSession();
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
          (
            serverSeedHash: string,
            sessionData?: { data: TCoinflipSessionJSON; resume_state: string },
          ) => {
            console.log(sessionData);
            set({
              serverSeedHash,
              sessionData: sessionData?.data,
              gameState: sessionData?.resume_state || null,
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
  initializeListeners: () => {
    const coinflipSocket = useSocketStore.getState().socket;

    if (coinflipSocket) {
      // Listen for the server to send the client a message to continue the bet
      coinflipSocket.on(
        CoinFlipServerMessage.FLIP_RESULT,
        ({ session, result }) => {
          console.log("Received Flip Data:", result, session);
          set({
            sessionData: session,
            flipResult: result,
          });
        },
      );

      coinflipSocket.on(CoinFlipServerMessage.GAME_ENDED, ({ serverSeed }) => {
        set({
          serverSeed,
        });
        console.log("Game Ended", serverSeed);
      });

      coinflipSocket.on(
        CoinFlipServerMessage.GAME_CHANGE_STATE,
        ({ session, new_state }) => {
          console.log("Game State:", new_state);
          set({
            sessionData: session,
            gameState: new_state,
          });
        },
      );
    }
  },
  sessionCleanup: () => {
    set({
      sessionData: null,
      flipResult: null,
      gameState: null,
      serverSeed: null,
      gameSessionError: null,
    });
  },
  createBet: (clientSeed: string, betAmount: string) => {
    const coinflipSocket = useSocketStore.getState().socket;

    if (coinflipSocket) {
      coinflipSocket.emit(
        CoinFlipClientMessage.CREATE_BET,
        {
          client_seed: clientSeed,
          amount: betAmount,
        },
        (ack: TCoinflipAck) => {
          if (ack.status === "SUCCESS") {
            set({
              sessionData: ack.session,
            });
          }
        },
      );
    }
  },
  flipCoin: (choice: TCoinflipSessionClientGameData) => {
    const coinflipSocket = useSocketStore.getState().socket;

    coinflipSocket?.emit(
      CoinFlipClientMessage.FLIP_COIN,
      choice,
      (ack: TCoinflipAck) => {
        if (ack.status === "SUCCESS") {
          set({
            sessionData: ack.session,
          });
        }
      },
    );
  },
  sessionNext: (option: "CASHOUT" | "CONTINUE") => {
    const coinflipSocket = useSocketStore.getState().socket;

    console.log("Session Next:", option);

    coinflipSocket?.emit(
      CoinFlipClientMessage.SESSION_NEXT,
      option,
      (ack: TCoinflipAck) => {
        if (ack.status === "SUCCESS") {
          console.log("Session Next Ack:", ack);
          set({
            sessionData: ack.session,
          });
        }
      },
    );
  },
}));

export default useCoinflipStore;
