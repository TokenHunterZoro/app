class PriceMonitor {
  constructor(tokenMonitor) {
    this.connection = tokenMonitor.connection;
    this.tokens = tokenMonitor.tokens;
    this.prices = new Map();

    // Update interval (10 seconds)
    this.updateInterval = 10000;
  }

  async start() {
    // Initial price fetch
    await this.updateAllPrices();

    // Set up interval for updates
    setInterval(async () => {
      await this.updateAllPrices();
    }, this.updateInterval);
  }

  async updateAllPrices() {
    for (const tokenAddress of this.tokens.keys()) {
      try {
        // Get recent trades for price
        const trades = await this.connection.getConfirmedSignaturesForAddress2(
          new PublicKey(tokenAddress),
          { limit: 1 }
        );

        if (trades.length > 0) {
          const tx = await this.connection.getTransaction(trades[0].signature);
          const price = this.extractPrice(tx);

          this.prices.set(tokenAddress, {
            price,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error updating price for ${tokenAddress}:`, error);
      }
    }

    this.saveToFile("prices.json", Array.from(this.prices.entries()));
  }

  saveToFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  }
}

// Usage
async function main() {
  const tokenMonitor = new TokenMonitor();
  const priceMonitor = new PriceMonitor(tokenMonitor);

  await tokenMonitor.start();
  await priceMonitor.start();

  // Basic HTTP server for data access
  const express = require("express");
  const app = express();
  const port = 3000;

  app.get("/tokens", (req, res) => {
    res.json(Array.from(tokenMonitor.tokens.values()));
  });

  app.get("/prices", (req, res) => {
    res.json(Array.from(priceMonitor.prices.entries()));
  });

  app.listen(port, () => {
    console.log(`Monitor running on port ${port}`);
  });
}

main().catch(console.error);
