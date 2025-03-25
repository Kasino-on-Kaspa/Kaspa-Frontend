import { Socket } from "socket.io-client";
import {
  CoinFlipClientMessage,
  CoinFlipServerMessage,
  TCoinflipAck,
  TCoinflipSessionClientGameData,
  TCoinflipSessionGameResult,
  TCoinflipSessionJSON,
} from "./coinflip";
import { DieRollClientMessage, DieRollServerMessage } from "./dieroll";
import { User } from "./user";
import { BaseBetType } from "./base";
import { z } from "zod";

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
  [CoinFlipClientMessage.GET_SESSION]: (
    callback: (
      serverSeedHash: string,
      sessionData?: { data: TCoinflipSessionJSON; resume_state: string },
    ) => void,
  ) => void;
  [CoinFlipClientMessage.CREATE_BET]: (
    bet_data: z.infer<typeof BaseBetType>,
    ack: (ack: TCoinflipAck) => void,
  ) => void;
  [CoinFlipClientMessage.FLIP_COIN]: (
    choice: TCoinflipSessionClientGameData,
    ack: (ack: TCoinflipAck) => void,
  ) => void;

  [CoinFlipClientMessage.SESSION_NEXT]: (
    option: "CASHOUT" | "CONTINUE",
    ack: (ack: TCoinflipAck) => void,
  ) => void;

  // Dieroll events
  [DieRollClientMessage.PLACE_BET]: (bet_data: any, ack: TCoinflipAck) => void;
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
  [CoinFlipServerMessage.GAME_CHANGE_STATE]: ({
    session,
    new_state,
  }: {
    session: TCoinflipSessionJSON;
    new_state: string;
  }) => void;
  [CoinFlipServerMessage.FLIP_RESULT]: (data: {
    session: TCoinflipSessionJSON;
    result: TCoinflipSessionGameResult;
  }) => void;
  [CoinFlipServerMessage.GAME_ENDED]: (data: { serverSeed: string }) => void;

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
