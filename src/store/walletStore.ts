import { create } from "zustand";
import { KaspaWallet, NetworkType } from "@/types/kaspa";
import { WalletState, WalletBalance, UserData } from "@/types/wallet";
import {
  login,
  fetchUserData,
  updateUsername,
  deleteUser,
  updateReferredBy,
} from "@/lib/walletApi";

const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  address: null,
  publicKey: null,
  balance: null,
  network: null,
  isConnecting: false,
  isAuthenticated: false,
  authError: null,
  authExpiry: null,
  userData: null,
  setWallet: (wallet: KaspaWallet | null) => set({ wallet }),
  setAddress: (address: string | null) => set({ address }),
  setPublicKey: (publicKey: string | null) => set({ publicKey }),
  setBalance: (balance: WalletBalance | null) => set({ balance }),
  setNetwork: (network: NetworkType | null) => set({ network }),
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setAuthError: (error: string | null) => set({ authError: error }),
  setAuthExpiry: (expiry: number | null) => set({ authExpiry: expiry }),
  setUserData: (userData: UserData | null) => set({ userData }),
  disconnect: () => {
    localStorage.removeItem("authTokens");
    set({
      address: null,
      balance: null,
      network: null,
      isAuthenticated: false,
      authError: null,
      authExpiry: null,
      userData: null,
    });
  },
  checkAuthExpiry: () => {
    const { authExpiry } = get();
    if (authExpiry && Date.now() / 1000 >= authExpiry) {
      localStorage.removeItem("authTokens");
      set({
        isAuthenticated: false,
        authExpiry: null,
        authError: "Authentication expired",
        userData: null,
      });
    }
  },
  initWallet: async (wallet: KaspaWallet) => {
    console.log("Initializing wallet...");
    set({ wallet });
    try {
      const accounts = await wallet.getAccounts();
      console.log("Got accounts:", accounts);
      if (accounts.length > 0) {
        set({ address: accounts[0] });
        const network = await wallet.getNetwork();
        set({ network });
        const balance = await wallet.getBalance();
        set({ balance });

        // Check for existing session
        const storedTokens = localStorage.getItem("authTokens");
        if (storedTokens) {
          set({
            isAuthenticated: true,
            authError: null,
          });
          return;
        }

        // If no session, authenticate
        await get().authenticate();
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
      set({
        authError:
          error instanceof Error
            ? error.message
            : "Failed to initialize wallet",
      });
    }
  },
  authenticate: async () => {
    const { address, publicKey } = get();
    if (!address || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const data = await login(address, publicKey);
      localStorage.setItem(
        "authTokens",
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      set({
        isAuthenticated: true,
        authError: null,
        authExpiry: data.expiry,
        userData: data.user,
      });
    } catch (error) {
      console.error("Authentication error:", error);
      set({
        isAuthenticated: false,
        authError:
          error instanceof Error ? error.message : "Authentication failed",
      });
      throw error;
    }
  },
  fetchUserData: async () => {
    try {
      const userData = await fetchUserData();
      set({ userData });
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({
        authError:
          error instanceof Error ? error.message : "Failed to fetch user data",
      });
      throw error;
    }
  },
  updateUsername: async (username: string) => {
    try {
      const userData = await updateUsername(username);
      set({ userData });
    } catch (error) {
      console.error("Error updating username:", error);
      set({
        authError:
          error instanceof Error ? error.message : "Failed to update username",
      });
      throw error;
    }
  },
  deleteUser: async () => {
    try {
      await deleteUser();
      localStorage.removeItem("authTokens");
      set({
        isAuthenticated: false,
        userData: null,
        authError: null,
        authExpiry: null,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      set({
        authError:
          error instanceof Error ? error.message : "Failed to delete user",
      });
      throw error;
    }
  },
  updateReferredBy: async (referralCode: string) => {
    try {
      const userData = await updateReferredBy(referralCode);
      set({ userData });
    } catch (error) {
      console.error("Error updating referral code:", error);
      set({
        authError:
          error instanceof Error
            ? error.message
            : "Failed to update referral code",
      });
      throw error;
    }
  },
}));

export default useWalletStore;
