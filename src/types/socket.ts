import { Socket } from "socket.io-client";
import {
  CoinFlipClientMessage,
  CoinFlipServerMessage,
  TCoinflipAck,
  TCoinflipSessionClientGameData,
  TCoinflipSessionGameResult,
  TCoinflipSessionJSON,
} from "./coinflip";

import {
  DieRollClientMessage,
  DieRollServerMessage,
  TDieRollAck,
  TDieRollGameResult,
  TDierollSessionJSON,
} from "./dieroll";
import { User } from "./user";
import { BaseBetType } from "./base";
import { z } from "zod";

// Event handler types
export type SocketEventHandler = (...args: any[]) => void;
export type SocketEventHandlers = {
  [K in keyof ServerToClientEvents]?: SocketEventHandler;
};

// Connection state types
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  lastConnectedAt: number | null;
  reconnectAttempts: number;
}

// Socket configuration
export interface SocketConfig {
  reconnectionAttempts: number;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  timeout: number;
}

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
  "wallet:refresh": () => void;
  "wallet:withdraw": (addr: string, bal: string) => void;

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
  [DieRollClientMessage.PLACE_BET]: (
    bet_data: any,
    ack: (ackStatus: TDieRollAck) => void,
  ) => void;
  [DieRollClientMessage.GET_SESSION]: (
    callback: (
      serverSeedHash: string,
      sessionData: TDierollSessionJSON,
    ) => void,
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
  "wallet:update": (data: { balance: string }) => void;
  "log:new": (data: {
    username: string;
    result: string;
    bet: string;
    payout: string;
  }) => void;
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
  [DieRollServerMessage.ROLL_RESULT]: (result: TDieRollGameResult) => void;
  [DieRollServerMessage.GAME_ENDED]: ({
    serverSeed,
  }: {
    serverSeed: string;
  }) => void;
}

export type SocketType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null;

export interface SocketState extends ConnectionState {
  socket: SocketType;
  config: SocketConfig;
  eventHandlers: SocketEventHandlers;
  setIsConnected: (isConnected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setLastConnectedAt: (timestamp: number | null) => void;
  setReconnectAttempts: (attempts: number) => void;
  registerEventHandler: <K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K],
  ) => void;
  unregisterEventHandler: <K extends keyof ServerToClientEvents>(
    event: K,
  ) => void;
  reconnect: () => void;
  connect: () => void;
  disconnect: () => void;
  cleanup: () => void;
}

export interface HandshakeResponse {
  wallet: string;
  address: string;
  id: string;
  username: string | null;
  balance: string;
}

export interface HandshakeResponse {
  wallet: string;
  address: string;
  id: string;
  username: string | null;
  balance: string;
}

export interface HandshakeResponse {
  wallet: string;
  address: string;
  id: string;
  username: string | null;
  balance: string;
}
