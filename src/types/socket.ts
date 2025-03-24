import { Socket } from "socket.io-client";
import { CoinFlipClientMessage, CoinFlipServerMessage } from "./coinflip";
import { DieRollClientMessage, DieRollServerMessage } from "./dieroll";
import { User } from "./user";

/**
 * Socket data interface for authenticated sockets
 */
export interface IAuthenticatedSocketData {
  user: User;
}

/**
 * Client to server events based on the codebase
 */
export interface ClientToServerEvents {
  // Wallet events
  "wallet:updateBalance": () => void;
  "wallet:getBalance": () => void;

  // Coinflip events
  [CoinFlipClientMessage.GET_SESSION_SEED]: (
    callback: (serverSeedHash: string, sessionId?: string) => void,
  ) => void;
  [CoinFlipClientMessage.CREATE_BET]: (
    bet_data: any,
    ack: (response: { success: boolean; error?: string }) => void,
  ) => void;
  [CoinFlipClientMessage.FLIP_COIN]: (
    session_id: string,
    choice: "HEADS" | "TAILS",
    ack: (response: { success: boolean; error?: string }) => void,
  ) => void;
  [CoinFlipClientMessage.CONTINUE_BET]: (
    session_id: string,
    ack: (response: { success: boolean; error?: string }) => void,
  ) => void;
  [CoinFlipClientMessage.SESSION_NEXT]: (
    session_id: string,
    option: "CASHOUT" | "CONTINUE",
    ack: (response: { success: boolean; error?: string }) => void,
  ) => void;

  // Dieroll events
  [DieRollClientMessage.PLACE_BET]: (
    bet_data: any,
    ack: (response: { success: boolean; error?: string }) => void,
  ) => void;
  [DieRollClientMessage.GET_SESSION_SEEDS]: (
    callback: (serverSeedHash: string) => void,
  ) => void;

  // Default Socket.IO events
  disconnect: () => void;
}

/**
 * Server to client events based on the codebase
 */
export interface ServerToClientEvents {
  // Wallet events
  "wallet:error": (data: { message: string }) => void;
  "wallet:balance": (data: { balance: string; address: string }) => void;
  "account:handshake": (data: HandshakeResponse) => void;

  // Coinflip events
  [CoinFlipServerMessage.GAME_CHANGE_STATE]: (newState: any) => void;
  [CoinFlipServerMessage.FLIP_RESULT]: (data: {
    result: "HEADS" | "TAILS";
    client_won: boolean;
  }) => void;
  [CoinFlipServerMessage.GAME_ENDED]: () => void;

  // Dieroll events
  [DieRollServerMessage.ROLL_RESULT]: (result: any) => void;
  [DieRollServerMessage.GAME_ENDED]: () => void;
}

/**
 * Type alias for Socket.IO client with typed events
 */
export type SocketType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null;

export interface SocketState {
  socket: SocketType;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
  connect: () => void;
  disconnect: () => void;
}

export interface HandshakeResponse {
  wallet: string;
  address: string;
  id: string;
  username: string | null;
  balance: string;
}
