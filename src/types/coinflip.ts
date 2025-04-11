// Client -> Server messages
export const enum CoinFlipClientMessage {
  GET_SESSION = "coinflip:get_session",

  CREATE_BET = "coinflip:create_bet",
  FLIP_COIN = "coinflip:flip_coin",
  CONTINUE_BET = "coinflip:continue_bet",
  SESSION_NEXT = "coinflip:session_next",
}

// Server -> Client messages
export const enum CoinFlipServerMessage {
  GAME_CHANGE_STATE = "coinflip:game_change_state",
  FLIP_RESULT = "coinflip:flip_result",
  GAME_ENDED = "coinflip:game_ended",
}

export type TCoinflipSessionClientGameData = "HEADS" | "TAILS" | "CASHOUT";

export type TCoinflipSessionGameResult = "HEADS" | "TAILS";

export type TCoinflipSessionJSON = {
  sessionId: string;
  serverSeedHash: string;
  clientGameData: TCoinflipSessionClientGameData;
  logs: TCoinflipSessionLog[];
  level: number;
  maxLevel: number;
};
export type TCoinflipSessionLog = {
  result: TCoinflipSessionGameResult;
  playerChoice: TCoinflipSessionClientGameData;
  client_won: boolean;
  level: number;
  next: string;
};

export interface CoinflipStore {
  gameIsEnded: boolean;
  isConnected: boolean;
  setSelectedSide: (side: TCoinflipSessionClientGameData) => void;
  selectedSide: TCoinflipSessionClientGameData | null;
  isBusy: boolean;
  setIsBusy: (isBusy: boolean) => void;
  flipResult: TCoinflipSessionGameResult | null;
  gameState: string | null;
  sessionData: TCoinflipSessionJSON | null;
  serverSeed: string | null;
  gameSessionError: string | null;
  serverSeedHash: string | null;
  initializeGame: () => void;
  startSession: () => void;
  initializeListeners: () => void;
  sessionCleanup: () => void;
  createBet: (clientSeed: string, betAmount: string) => void;
  flipCoin: (choice: TCoinflipSessionClientGameData) => void;
}

export type TCoinflipAck =
  | {
      status: "SUCCESS";
      session: TCoinflipSessionJSON;
    }
  | {
      status: "ERROR";
      message: string;
    };
