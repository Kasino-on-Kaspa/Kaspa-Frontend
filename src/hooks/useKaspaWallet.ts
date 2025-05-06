import { useContext } from "react";
import { KaspaWalletContext } from "@/components/context/KaspaWalletContext";

export default function useKaspaWallet() {
  const { kaspaWallet } = useContext(KaspaWalletContext);
  return kaspaWallet;
}
