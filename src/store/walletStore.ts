import { create } from "zustand";
import {
  NetworkType,
  Balance,
  KaspaWallet,
  OnBalanceChanged,
} from "@/types/kaspa";
import { setAuthTokens, getStoredTokens, clearTokens } from "@/lib/auth";
import { getMessageForSigning } from "@/lib/walletQueries";
import useSocketStore from "./socketStore";
import { HandshakeResponse } from "@/types/socket";
import { toast } from "sonner";

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
    balance?: string;
    address?: string;
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
  refreshWalletBalance: () => void;
  withdrawBalance: (amount: string) => void;
  handleBalanceChanged: (data: OnBalanceChanged) => void;
}

const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  mainWalletBalance: null,
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
  setBalance: (balance) => {
    try {
      if (!balance) {
        console.warn("Attempted to set null balance");
        return;
      }
      set({ balance });
    } catch (error) {
      console.error("Error setting balance:", error);
      toast.error("Failed to update wallet balance");
    }
  },
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

        try {
          const balance = await wallet.getBalance();
          set({ balance });
        } catch (error) {
          console.error("Error fetching initial balance:", error);
          toast.error("Failed to fetch wallet balance");
        }

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
      toast.error("Failed to initialize wallet");
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
      console.log("Existing tokens:", existingTokens);
      if (existingTokens?.accessToken && existingTokens?.refreshToken) {
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

      console.log("Auth data:", authData);

      setAuthTokens({
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      wallet?.on("balanceChanged", (data: OnBalanceChanged) => {
        if (data.balance.pendingUtxoCount == 0) {
          set({
            balance: {
              total: data.balance.mature,
              confirmed: get().balance?.confirmed || 0,
              unconfirmed: get().balance?.unconfirmed || 0,
            },
          });
        }
      });

      // const walletData = await authenticatedFetch(
      //   `${import.meta.env.VITE_BACKEND_URL}/wallet/deposit`,
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ wallet_id: authData?.user.depositAddress }),
      //   }
      // );

      // const walletDataJson = await walletData.json();

      // set({
      //   isAuthenticated: true,
      //   authError: null,
      //   authExpiry: expiry,
      //   onSiteBalance: {
      //     address: walletDataJson.address,
      //     balance: walletDataJson.balance || 0,
      //   },
      // });

      const storedTokens = getStoredTokens();

      if (storedTokens?.accessToken && storedTokens?.refreshToken) {
        set({
          isAuthenticated: true,
          authError: null,
          authExpiry: expiry,
        });
      } else {
        set({
          isAuthenticated: false,
          authError: "No tokens found",
          authExpiry: null,
        });
      }

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
    const socket = useSocketStore.getState().socket;
    if (!socket) return;

    try {
      socket.once(
        "account:handshake",
        ({ wallet, balance }: HandshakeResponse) => {
          console.log("Handshake received:", wallet, balance);
          set({
            isAuthenticated: true,
            onSiteBalance: {
              balance,
              address: wallet,
            },
          });
        },
      );

      socket.on("wallet:update", ({ balance }) => {
        try {
          set({
            onSiteBalance: {
              balance,
              address: get().onSiteBalance?.address,
            },
          });

          get().refreshWalletBalance();
        } catch (error) {
          console.error("Error updating onsite balance:", error);
          toast.error("Failed to update onsite balance");
        }
      });

      // Add error handler for wallet events
      socket.on("wallet:error", ({ message }) => {
        console.error("Wallet error:", message);
        toast.error(message);
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        authError: "Error initializing wallet socket listeners",
      });
      console.error("Error initializing wallet socket listeners:", error);
      toast.error("Failed to initialize wallet connection");
    }
  },
  refreshWalletBalance: async () => {
    const walletSocket = useSocketStore.getState().socket;
    const { wallet } = get();

    try {
      // Update local wallet balance
      if (wallet) {
        const balance = await wallet.getBalance();
        set({ balance });
      }

      // Update onsite balance through socket
      if (walletSocket) {
        walletSocket.emit("wallet:refresh");
      }
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
      toast.error("Failed to refresh wallet balance");
    }
  },
  withdrawBalance: async (amount: string) => {
    const walletSocket = useSocketStore.getState().socket;
    const { address, onSiteBalance } = get();

    try {
      if (!walletSocket) {
        throw new Error("Socket connection not available");
      }

      if (!address) {
        throw new Error("No wallet address available");
      }

      if (
        !onSiteBalance?.balance ||
        Number(amount) > Number(onSiteBalance.balance)
      ) {
        throw new Error("Insufficient balance");
      }

      walletSocket.emit("wallet:withdraw", address, amount);
      toast.success("Withdrawal request submitted");
    } catch (error) {
      console.error("Error withdrawing balance:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to withdraw balance",
      );
    }
  },
  handleBalanceChanged: (data: OnBalanceChanged) => {
    try {
      if (data.balance.pendingUtxoCount === 0) {
        set({
          balance: {
            total: data.balance.mature,
            confirmed: get().balance?.confirmed || 0,
            unconfirmed: get().balance?.unconfirmed || 0,
          },
        });

        get().refreshWalletBalance();
      }
    } catch (error) {
      console.error("Error handling balance change:", error);
      toast.error("Failed to update wallet balance");
    }
  },
}));

export default useWalletStore;
