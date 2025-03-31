import { z } from "zod";
import { BaseBetType } from "./base";

// Client -> Server messages
export const enum DieRollClientMessage {
  GET_SESSION = "dieroll:get_session",
  PLACE_BET = "dieroll:place_bet",
}

// Server -> Client messages
export const enum DieRollServerMessage {
  ROLL_RESULT = "dieroll:roll_result",
  GAME_ENDED = "dieroll:game_ended",
}

// Message payload types
export interface PlaceBetPayload {
  amount: number;
  prediction: number; // 1-6
}

export interface RollResultPayload {
  result: number;
  won: boolean;
  payout: number;
}

export interface GameStatePayload {
  gameId: string;
  currentBet?: number;
  prediction?: number;
  phase: "BETTING" | "ROLLING" | "ENDED";
}

export interface DicerollStore {
  isConnected: boolean;
  sessionData: TDierollSessionJSON | null;
  serverSeed: string | null;
  gameSessionError: string | null;
  serverSeedHash: string | null;
  rollResult: TDieRollGameResult | null;
  initializeGame: () => void;
  startSession: () => void;
  placeBet: (betData: z.infer<typeof DieRollBetType>) => void;
  intializeListeners: () => void;
  cleanup: () => void;
}

export type TDierollSessionJSON = {
  sessionId: string;
  serverSeedHash: string;
  clientGameData?: TDierollSessionClientGameData;
  clientBetData?: TBetClientData;
  gameResult?: TDieRollGameResult;
  gameResultIsWon?: "DRAW" | "WON" | "LOST";
};

export type TDieRollGameResult = number;

export type TBetClientData = {
  clientSeed: string;
  bet: bigint;
  multiplier: number;
};

export type TDierollSessionClientGameData = {
  condition: z.infer<typeof DieRollBetType>["condition"];
  target: z.infer<typeof DieRollBetType>["target"];
};

export const DieRollBetType = BaseBetType.extend({
  client_seed: z.string(),
  condition: z.enum(["OVER", "UNDER"]),
  target: z.number().min(1).max(99),
  amount: z.string(), // Changed from number to string for BigInt compatibility
});

export type TDierollBetResult = {
  sessionId: string;
  serverSeed: string;
  payout: bigint;
  resultRoll: number;
  isWon: boolean;
  betAmount: bigint;
};

export type TDieRollAck =
  | {
      status: "SUCCESS";
      session: TDierollSessionJSON;
    }
  | {
      status: "ERROR";
      message: string;
    };

export interface RollHistory {
  roll: number;
  multiplier: number;
  profit: number;
  timestamp: number;
  clientSeed: string;
  serverSeed?: string;
  serverSeedHash: string;
  target: number;
  condition: "OVER" | "UNDER";
}
