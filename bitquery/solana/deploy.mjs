import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
import { promises as fs } from "fs";

async function createTestBonk() {
  // Connect to Solana devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Generate a new wallet for deployment
  const walletKeyPair = JSON.parse(
    await fs.readFile("../wallet-keypair.json", "utf8")
  );
  const deployerWallet = Keypair.fromSecretKey(Uint8Array.from(walletKeyPair));
  console.log("Deployer address:", deployerWallet.publicKey.toBase58());

  // // Request airdrop for deployment fees
  // console.log("Requesting airdrop for deployment...");
  // const airdropSignature = await connection.requestAirdrop(
  //   deployerWallet.publicKey,
  //   1000000000 // 1 SOL
  // );
  // await connection.confirmTransaction(airdropSignature);

  // TestBonk Configuration
  const TOKEN_DECIMALS = 6; // Same as original BONK
  const INITIAL_SUPPLY = 1_000_000_000_000; // 1 trillion tokens
  const TOKEN_NAME = "TestBonk";
  const TOKEN_SYMBOL = "TBONK";

  console.log("Creating TestBonk token mint...");
  // Create TestBonk token mint
  const testBonkMint = await createMint(
    connection,
    deployerWallet,
    deployerWallet.publicKey, // Mint authority
    deployerWallet.publicKey, // Freeze authority (can be null)
    TOKEN_DECIMALS
  );

  console.log("TestBonk token mint created:", testBonkMint.toBase58());

  // Create token account for deployer
  console.log("Creating token account...");
  const deployerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    deployerWallet,
    testBonkMint,
    deployerWallet.publicKey
  );

  console.log(
    "Token account created:",
    deployerTokenAccount.address.toBase58()
  );

  // Mint initial supply
  console.log("Minting initial supply...");
  const mintTx = await mintTo(
    connection,
    deployerWallet,
    testBonkMint,
    deployerTokenAccount.address,
    deployerWallet.publicKey,
    INITIAL_SUPPLY * Math.pow(10, TOKEN_DECIMALS) // Adjust for decimals
  );

  console.log("Initial supply minted:", mintTx);

  // Optional: Create a mint authority for future minting
  // This allows you to mint more tokens later if needed

  const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(walletKeyPair));
  console.log("Mint authority created:", mintAuthority.publicKey.toBase58());

  // Transfer mint authority
  console.log("Transferring mint authority...");
  await setAuthority(
    connection,
    deployerWallet,
    testBonkMint,
    deployerWallet.publicKey,
    AuthorityType.MintTokens,
    mintAuthority.publicKey
  );

  return {
    tokenName: TOKEN_NAME,
    tokenSymbol: TOKEN_SYMBOL,
    tokenMint: testBonkMint.toBase58(),
    tokenDecimals: TOKEN_DECIMALS,
    initialSupply: INITIAL_SUPPLY,
    deployerAddress: deployerWallet.publicKey.toBase58(),
    deployerTokenAccount: deployerTokenAccount.address.toBase58(),
    mintAuthority: mintAuthority.publicKey.toBase58(),
  };
}

// Function to mint more TestBonk tokens
async function mintMoreTestBonk(
  mintAuthority,
  mintAddress,
  recipientAddress,
  amount
) {
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
    amount
  );

  return mintTx;
}

// Deploy TestBonk
// createTestBonk()
//   .then((result) => {
//     console.log("TestBonk deployed successfully!");
//     console.log("Token details:", {
//       ...result,
//       //   deployerPrivateKey: "***[SECURE]***", // Hide private keys in logs
//       //   mintAuthorityPrivateKey: "***[SECURE]***",
//     });
//   })
//   .catch((error) => {
//     console.error("Error deploying TestBonk:", error);
//   });

const walletKeyPair = JSON.parse(
  await fs.readFile("../wallet-keypair.json", "utf8")
);
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(walletKeyPair));

mintMoreTestBonk(
  mintAuthority,
  new PublicKey("J5xh6VWTmNmgVmhgGqEd6fgzZunt2hPqLmiXB85C5Wna"),
  new PublicKey("9XrM3KtTBXP3GFbV3okWCPKmmrV84UAFYGHJp9qZFnpZ"),
  620000000000
);
