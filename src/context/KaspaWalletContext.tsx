import { createContext } from "react";
import { KaspaWallet } from "@/types/kaspa";

interface KaspaWalletContextType {
  kaspaWallet: KaspaWallet | undefined;
}

export const KaspaWalletContext = createContext<KaspaWalletContextType>({
  kaspaWallet: undefined,
});
