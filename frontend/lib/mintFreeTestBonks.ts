import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import walletKeyPair from "./wallet-keypair.json";
import { TEST_BONK_TOKEN_MINT_ADDRESS } from "./constants";

export default async function mintFreeTestBonks(
  recipientAddressString: string
) {
  const mintAddress = new PublicKey(TEST_BONK_TOKEN_MINT_ADDRESS);
  const recipientAddress = new PublicKey(recipientAddressString);
  const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(walletKeyPair));

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  console.log("Getting or creating account");
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthority,
    mintAddress,
    recipientAddress
  );

  console.log("Minting more TestBonk tokens...");
  const mintTx = await mintTo(
    connection,
    mintAuthority,
    mintAddress,
    recipientTokenAccount.address,
    mintAuthority.publicKey,
    500000000000
  );

  return mintTx;
}
