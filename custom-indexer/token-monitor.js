const { Connection, PublicKey } = require("@solana/web3.js");
const fs = require("fs").promises;
const path = require("path");

class TokenMonitor {
  constructor() {
    this.connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );
    this.PUMP_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
    this.programPublicKey = new PublicKey(this.PUMP_PROGRAM_ID);
    this.tokens = new Map();
    this.subscription = null;
  }

  async start() {
    console.log("Starting Pump Token Monitor...");

    this.subscription = this.connection.onProgramAccountChange(
      this.programPublicKey,
      (accountInfo) => this.handleAccountChange(accountInfo),
      "confirmed"
    );

    process.on("SIGINT", async () => {
      await this.stop();
      process.exit(0);
    });
  }

  async handleAccountChange(accountInfo) {
    try {
      const { accountId, accountInfo: info } = accountInfo;
      await this.processAccountChange(accountId, info);
    } catch (error) {
      console.error("Error processing account:", error);
    }
  }

  async getTokenMetadata(address) {
    try {
      const metaplexPDA = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ).toBuffer(),
          new PublicKey(address).toBuffer(),
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
      )[0];

      const accountInfo = await this.connection.getAccountInfo(metaplexPDA);
      if (!accountInfo)
        return {
          name: `PMP-${address.slice(0, 4)}`,
          symbol: `P-${address.slice(0, 4)}`,
        };

      // Basic metadata parsing
      const name = accountInfo.data
        .slice(67, 100)
        .toString()
        .replace(/\0/g, "");
      const symbol = accountInfo.data
        .slice(101, 111)
        .toString()
        .replace(/\0/g, "");

      return { name, symbol };
    } catch (error) {
      console.error("Metadata fetch error:", error);
      return {
        name: `PMP-${address.slice(0, 4)}`,
        symbol: `P-${address.slice(0, 4)}`,
      };
    }
  }

  async processAccountChange(pubkey, info) {
    const metadata = await this.getTokenMetadata(pubkey.toBase58());

    const tokenData = {
      address: pubkey.toBase58(),
      timestamp: new Date().toISOString(),
      owner: info.owner.toBase58(),
      name: metadata.name,
      symbol: metadata.symbol,
      dataLength: info.data.length,
    };

    console.log("New token created:", tokenData);
    this.tokens.set(tokenData.address, tokenData);
    await this.saveTokens();
  }

  async saveTokens() {
    const data = Array.from(this.tokens.values());
    await fs.writeFile(
      path.join(process.cwd(), "tokens.json"),
      JSON.stringify(data, null, 2)
    );
  }

  async stop() {
    if (this.subscription) {
      await this.connection.removeAccountChangeListener(this.subscription);
      this.subscription = null;
    }
  }
}

const monitor = new TokenMonitor();
monitor.start().catch(console.error);
