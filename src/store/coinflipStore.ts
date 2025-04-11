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
import { kasToSompi } from "@/lib/utils";
import useWalletStore from "./walletStore";

const useCoinflipStore = create<CoinflipStore>((set, get) => ({
  selectedSide: null,
  isBusy: false,
  isConnected: false,
  flipResult: null,
  sessionData: null,
  gameState: null,
  logs: null,
  serverSeed: null,
  gameSessionError: null,
  serverSeedHash: null,
  gameIsEnded: false,
  setIsBusy: (isBusy: boolean) => {
    set({ isBusy });
  },
  setSelectedSide: (side: TCoinflipSessionClientGameData) => {
    console.log("Setting selected side:", side);
    set({ selectedSide: side });
  },
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
            console.log("Session data received:", sessionData);
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
    const walletStore = useWalletStore.getState();

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
          gameIsEnded: true,
        });
        console.log("Game Ended", serverSeed);
      });

      coinflipSocket.on(
        CoinFlipServerMessage.GAME_CHANGE_STATE,
        ({ session, new_state }) => {
          console.log("Game State Changed", new_state);
          if (new_state === "END") {
            walletStore.refreshWalletBalance();
          }
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
      selectedSide: null,
      gameIsEnded: false,
    });
  },
  createBet: (clientSeed: string, betAmount: string) => {
    const coinflipSocket = useSocketStore.getState().socket;

    if (coinflipSocket) {
      coinflipSocket.emit(
        CoinFlipClientMessage.CREATE_BET,
        {
          client_seed: clientSeed,
          amount: kasToSompi(betAmount).toString(),
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
