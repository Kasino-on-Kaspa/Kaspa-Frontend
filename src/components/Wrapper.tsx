"use client";

import KaspaWalletProvider from "./KaspaWalletProvider";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return <KaspaWalletProvider>{children}</KaspaWalletProvider>;
}
