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

export type TCoinflipSessionClientGameData = "HEADS" | "TAILS";

export type TCoinflipSessionGameResult = "HEADS" | "TAILS";

export type TCoinflipSessionJSON = {
  sessionId: string;
  serverSeedHash: string;
  clientGameData: TCoinflipSessionClientGameData;
};

export interface CoinflipStore {
  isConnected: boolean;
  sessionData: TCoinflipSessionJSON | null;
  serverSeed: string | null;
  gameSessionError: string | null;
  serverSeedHash: string | null;
  initializeGame: () => void;
  startSession: () => void;
  initializeListeners: () => void;
  sessionCleanup: () => void;
  getSessionSeed: () => void;
  createBet: () => void;
  flipCoin: () => void;
  continueBet: () => void;
  sessionNext: () => void;
}
