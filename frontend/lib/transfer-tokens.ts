import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  TEST_BONK_TOKEN_MINT_ADDRESS,
  ZOROX_TREASURY_ADDRESS,
} from "./constants";

export default async function transferTokens() {
  try {
    // Connect to Solana
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Phantom provider
    const provider = (window as any).phantom?.solana;
    if (!provider?.publicKey) throw new Error("Wallet not connected!");

    // Get the token mint
    const mint = new PublicKey(TEST_BONK_TOKEN_MINT_ADDRESS);
    const sender = provider.publicKey;
    const recipient = new PublicKey(ZOROX_TREASURY_ADDRESS);

    // Get the token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(mint, sender);
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mint,
      recipient
    );

    // Create transaction
    const transaction = new Transaction();

    // Check if recipient token account exists
    let recipientTokenAccountInfo;
    try {
      recipientTokenAccountInfo = await getAccount(
        connection,
        recipientTokenAccount
      );
    } catch (error) {
      // If account doesn't exist, add instruction to create it
      console.log("Creating recipient token account...");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender,
          recipientTokenAccount,
          recipient,
          mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        sender,
        499_999 * Math.pow(10, 6) // Adjust decimals based on your token (9 is common)
      )
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;

    // Sign and send transaction
    const signed = await provider.signAndSendTransaction(transaction);
    console.log("Transaction sent:", signed.signature);

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signed.signature);
    console.log("Transaction confirmed:", confirmation);

    return signed.signature;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
