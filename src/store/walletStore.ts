import { create } from "zustand";
import { NetworkType, Balance, KaspaWallet } from "@/types/kaspa";
import { setAuthTokens, getStoredTokens, clearTokens } from "@/lib/auth";
import { getMessageForSigning } from "@/lib/walletQueries";
import useSocketStore from "./socketStore";

interface UserData {
  username?: string;
}

interface WalletState {
  wallet: KaspaWallet | null;
  address: string;
  balance: Balance | null;
  network: NetworkType;
  isConnecting: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  onSiteBalance: {
    balance: string;
    address: string;
  } | null;
  authExpiry: number | null;
  userData: UserData | null;
  setWallet: (wallet: KaspaWallet | null) => void;
  setAddress: (address: string) => void;
  setBalance: (balance: Balance | null) => void;
  setNetwork: (network: NetworkType) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setAuthError: (error: string | null) => void;
  setAuthExpiry: (expiry: number | null) => void;
  setUserData: (userData: UserData | null) => void;
  disconnect: () => void;
  authenticate: () => Promise<void>;
  initWallet: (wallet: KaspaWallet) => Promise<void>;
  checkAuthExpiry: () => Promise<void>;
  initializeWalletSocketListeners: () => void;
}

const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  onSiteBalance: null,
  address: "",
  balance: null,
  network: "kaspa_mainnet",
  isConnecting: false,
  isAuthenticated: false,
  authError: null,
  authExpiry: null,
  userData: null,
  setWallet: (wallet) => set({ wallet }),
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setNetwork: (network) => set({ network }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthError: (error) => set({ authError: error }),
  setAuthExpiry: (expiry) => set({ authExpiry: expiry }),
  setUserData: (userData) => set({ userData }),

  disconnect: () => {
    clearTokens();
    set({
      address: "",
      balance: null,
      network: "kaspa_mainnet",
      isAuthenticated: false,
      authError: null,
      authExpiry: null,
      userData: null,
    });
  },
  checkAuthExpiry: async () => {
    const { authExpiry } = get();
    if (authExpiry && Date.now() / 1000 >= authExpiry) {
      try {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        setAuthTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // Update expiry time
        set({
          authError: null,
          authExpiry: data.expiry,
        });
      } catch (error) {
        console.error("Token refresh failed:", error);
        clearTokens();
        set({
          isAuthenticated: false,
          authExpiry: null,
          authError: "Authentication expired",
          userData: null,
        });
      }
    }
  },
  initWallet: async (wallet) => {
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

        const tokens = getStoredTokens();
        if (tokens) {
          set({
            isAuthenticated: true,
            authError: null,
          });
          return;
        }

        await get().authenticate();
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  },
  authenticate: async () => {
    console.log("Starting authentication...");
    const { wallet, address, network } = get();

    if (!wallet || !address) {
      console.log("No wallet or address available for authentication");
      return;
    }

    try {
      const existingTokens = getStoredTokens();
      if (existingTokens) {
        set({
          isAuthenticated: true,
          authError: null,
        });
        return;
      }

      const { message, nonce, expiry } = await getMessageForSigning(
        address,
        network,
      );

      const signature = await wallet.signMessage(message);

      const publicKey = await wallet.getPublicKey();

      const authData = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            signature,
            publicKey,
            address,
            nonce,
            expiry,
          }),
        },
      ).then((res) => res.json());

      setAuthTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      set({
        isAuthenticated: true,
        authError: null,
        authExpiry: expiry,
        userData: authData.user,
      });

      const checkInterval = setInterval(() => {
        get().checkAuthExpiry();
        if (!get().isAuthenticated) {
          clearInterval(checkInterval);
        }
      }, 1000);
    } catch (error) {
      console.error("Authentication error:", error);
      clearTokens();
      set({
        isAuthenticated: false,
        authError:
          error instanceof Error ? error.message : "Authentication failed",
        authExpiry: null,
        userData: null,
      });
    }
  },
  initializeWalletSocketListeners: () => {
    console.log("Initializing wallet socket listeners...");
    const socket = useSocketStore.getState().socket;
    if (!socket) return;

    try {
      socket.emit("wallet:getBalance");
      socket.on("wallet:balance", (balance) => {
        set({
          onSiteBalance: {
            balance: balance.balance,
            address: balance.address,
          },
        });
      });

      socket.on("wallet:error", (error) => {
        console.error("Wallet error:", error);
      });
    } catch (error) {
      console.error("Error initializing wallet socket listeners:", error);
    }
  },
}));

export default useWalletStore;
