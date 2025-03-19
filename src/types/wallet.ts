import { KaspaWallet, NetworkType } from "./kaspa";

export interface UserData {
  username?: string;
  referralCode?: string;
  referredBy?: string;
}

export interface WalletBalance {
  confirmed: string;
  unconfirmed: string;
  total: string;
}

export interface WalletState {
  wallet: KaspaWallet | null;
  address: string | null;
  publicKey: string | null;
  balance: WalletBalance | null;
  network: NetworkType | null;
  isConnecting: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  authExpiry: number | null;
  userData: UserData | null;
  setWallet: (wallet: KaspaWallet | null) => void;
  setAddress: (address: string | null) => void;
  setPublicKey: (publicKey: string | null) => void;
  setBalance: (balance: WalletBalance | null) => void;
  setNetwork: (network: NetworkType | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthExpiry: (expiry: number | null) => void;
  setUserData: (userData: UserData | null) => void;
  disconnect: () => void;
  authenticate: () => Promise<void>;
  initWallet: (wallet: KaspaWallet) => Promise<void>;
  checkAuthExpiry: () => void;
  fetchUserData: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  deleteUser: () => Promise<void>;
  updateReferredBy: (referralCode: string) => Promise<void>;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiry: number;
  user: UserData;
}
