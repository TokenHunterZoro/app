import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { TEST_BONK_TOKEN_MINT_ADDRESS } from "./constants";

export default async function fetchBalances(address: string) {
  // Initialize connection (replace with your preferred RPC endpoint)
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  try {
    // Convert addresses to PublicKeys
    const walletPublicKey = new PublicKey(address);
    const tokenMint = new PublicKey(TEST_BONK_TOKEN_MINT_ADDRESS);

    // Get SOL balance
    const solBalance = await connection.getBalance(walletPublicKey);
    const solBalanceInSol = solBalance / LAMPORTS_PER_SOL;

    // Get token balance
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletPublicKey
    );

    let tokenBalance = 0;
    try {
      const account = await getAccount(connection, tokenAccount);
      // Adjust the power of 10 based on your token's decimals (9 is common)
      tokenBalance = Number(account.amount) / Math.pow(10, 6);
    } catch (e) {
      console.log("No token account found");
    }

    return {
      sol: solBalanceInSol,
      token: tokenBalance,
    };
  } catch (error) {
    console.error("Error fetching balances:", error);
    return { sol: 0, token: 0 };
  }
}
