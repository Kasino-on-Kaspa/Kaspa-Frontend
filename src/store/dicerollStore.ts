import { create } from "zustand";
import { io } from "socket.io-client";
import { z } from "zod";
import {
  DicerollStore,
  TDierollSessionJSON,
  DieRollBetType,
  TDieRollAck,
  TDieRollGameResult,
} from "@/types/dieroll";

const useDicerollStore = create<DicerollStore>((set) => ({
  dierollSocket: null,
  sessionData: null,
  serverSeedHash: null,
  gameSessionError: null,
  rollResult: null,
  initializeGame() {
    const dierollSocket = io(
      import.meta.env.VITE_SOCKET_URL + "/games/dieroll",
      {
        transports: ["websocket", "polling"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    );

    dierollSocket.connect();

    set({ dierollSocket });
  },
  startSession() {
    const dierollSocket = useDicerollStore.getState().dierollSocket;
    if (dierollSocket) {
      dierollSocket.emit(
        "dieroll:get_session",
        (serverSeedHash: string, sessionData: TDierollSessionJSON) => {
          set({ serverSeedHash, sessionData });
        },
      );
    }
  },
  placeBet(betData: z.infer<typeof DieRollBetType>) {
    const dierollSocket = useDicerollStore.getState().dierollSocket;

    if (dierollSocket) {
      dierollSocket.emit(
        "dieroll:place_bet",
        betData,
        (ackStatus: TDieRollAck) => {
          if (ackStatus.status === "SUCCESS") {
            set({ sessionData: ackStatus.session });
          } else {
            set({ gameSessionError: ackStatus.message });
          }
        },
      );
    }
  },
  intializeListeners() {
    const dierollSocket = useDicerollStore.getState().dierollSocket;

    if (dierollSocket) {
      dierollSocket.on("dieroll:roll_result", (result: TDieRollGameResult) => {
        set({ rollResult: result });
      });

      dierollSocket.on("dieroll:game_ended", (result: TDieRollGameResult) => {
        set({ rollResult: result });
      });
    }
  },
}));

export default useDicerollStore;
