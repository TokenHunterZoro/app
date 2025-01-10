"use client";

import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

export default function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set up the Solana network connection
  const endpoint = React.useMemo(() => clusterApiUrl("devnet"), []); // or your preferred network
  // Initialize wallet adapters
  const wallets = React.useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
