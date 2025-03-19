import { useContext } from "react";
import { KaspaWalletContext } from "@/context/KaspaWalletContext";

export default function useKaspaWallet() {
  const { kaspaWallet } = useContext(KaspaWalletContext);
  return kaspaWallet;
}
