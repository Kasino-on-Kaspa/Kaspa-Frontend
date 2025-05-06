"use client";

import { useEffect, useState } from "react";
import { KaspaWallet } from "@/types/kaspa";
import { KaspaWalletContext } from "./context/KaspaWalletContext";

export default function KaspaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [kaspaWallet, setKaspaWallet] = useState<KaspaWallet | undefined>();
  useEffect(() => {
    const kaswareInstance = (window as any).kasware;
    if (kaswareInstance) {
      setKaspaWallet(kaswareInstance);
    }
  }, []);

  return (
    <KaspaWalletContext.Provider value={{ kaspaWallet }}>
      {children}
    </KaspaWalletContext.Provider>
  );
}
