import axios from "axios";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { url } from "inspector";
dotenv.config();
class MemecoinFetcher {
  constructor() {
    this.client = axios.create({
      baseURL: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.BITQUERY_API_KEY,
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
    });

    // Modified query for EAP endpoint
    this.query = `
      {
  Solana {
    DEXTrades(
      limitBy: {by: Trade_Buy_Currency_MintAddress, count: 1}
      orderBy: {descending: Block_Time}
      where: {Trade: {Dex: {ProtocolName: {is: "pump"}}, Buy: {Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}}}, Transaction: {Result: {Success: true}},   Block: { Time: { since: "2024-12-10T02:29:46.945Z", till: "2024-12-10T08:29:46.945Z" } }}
    ) {
      Trade {
        Buy {
          Price
          PriceInUSD
          Currency {
            Name
            Symbol
            MintAddress
            Uri
          }
        }
      }
    }
  }
}

    `;
  }

  calculateMarketCap(price) {
    const TOTAL_SUPPLY = 1_000_000_000;
    return price * TOTAL_SUPPLY;
  }

  processTradeData(tradeData) {
    if (!tradeData || !Array.isArray(tradeData)) {
      console.log("Received trade data:", tradeData);
      return [];
    }

    return tradeData.map((trade) => {
      const currentPrice = trade.Trade.Buy.Price || 0;
      const priceUSD = trade.Trade.Buy.PriceInUSD || 0;

      return {
        token: {
          name: trade.Trade.Buy.Currency.Name,
          symbol: trade.Trade.Buy.Currency.Symbol,
          mintAddress: trade.Trade.Buy.Currency.MintAddress,
        },
        price: {
          current: currentPrice,
          usd: priceUSD,
        },
        marketCap: {
          sol: this.calculateMarketCap(currentPrice),
          usd: this.calculateMarketCap(priceUSD),
        },
        blockTime: trade.Block?.timestamp,
      };
    });
  }

  async fetchTimeSlice(startTime, endTime) {
    try {
      console.log("Fetching with variables:", {
        since: startTime.toISOString(),
        till: endTime.toISOString(),
      });

      console.log(process.env.BITQUERY_API_KEY);
      console.log(process.env.ACCESS_TOKEN);

      const { data, error } = await axios.request({
        method: "post",
        url: "https://streaming.bitquery.io/eap",
        data: JSON.stringify({
          query: `
            {
        Solana {
          DEXTrades(
            limitBy: {by: Trade_Buy_Currency_MintAddress, count: 1}
            orderBy: {descending: Block_Time}
            where: {Trade: {Dex: {ProtocolName: {is: "pump"}}, Buy: {Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}}}, Transaction: {Result: {Success: true}},   Block: { Time: { since: "${startTime.toISOString()}", till: "${endTime.toISOString()}" } }}
          ) {
            Trade {
              Buy {
                Price
                PriceInUSD
                Currency {
                  Name
                  Symbol
                  MintAddress
                  Uri
                }
              }
            }
          }
        }
      }
      
          `,
          variables: "{}",
        }),
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer ory_at_-ZbYLGkTLIgXPZpa4GPMkCuVL6vkPFSnm4aw1TUu85c.M4afucU7W7IZR6qLtVqxVVhtEfBTVIyWRjZGLV3AryE",
        },
      });
      console.log(data);
      console.log("Raw API Response:", JSON.stringify(data, null, 2));

      const rawTradeData = data.data.Solana.DEXTrades || [];
      const processedData = this.processTradeData(rawTradeData);

      if (processedData.length === 0) {
        console.log("No trades found or data processing error");
      }

      return {
        timeSlice: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        },
        data: processedData,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("API Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async saveToFile(data, timestamp) {
    const resultsDir = path.join(process.cwd(), "results");

    try {
      await fs.access(resultsDir);
    } catch {
      await fs.mkdir(resultsDir);
    }

    const fileName = `memecoin_data_${timestamp.replace(/[:.]/g, "-")}.json`;
    const filePath = path.join(resultsDir, fileName);

    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`Saved data to ${fileName}`);

      console.log("\nSummary for this time slice:");
      console.log(`Total tokens: ${data.summary.totalTokens}`);
      console.log(
        `Total volume (USD): $${data.summary.totalVolume.toLocaleString()}`
      );
      console.log(
        `Average market cap (USD): $${data.summary.averageMarketCapUSD.toLocaleString()}`
      );
    } catch (error) {
      console.error(`Error saving file ${fileName}:`, error.message);
      throw error;
    }
  }

  async fetchLast24Hours() {
    const now = new Date();
    const chunks = [];

    for (let i = 0; i < 4; i++) {
      const endTime = new Date(now - i * 6 * 60 * 60 * 1000);
      const startTime = new Date(endTime - 1500);
      chunks.push({ startTime, endTime });
      break;
    }

    for (const chunk of chunks) {
      try {
        console.log(
          `\nFetching data from ${chunk.startTime} to ${chunk.endTime}`
        );
        const data = await this.fetchTimeSlice(chunk.startTime, chunk.endTime);
        await this.saveToFile(data, chunk.startTime.toISOString());

        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error processing chunk:", error.message);
      }
    }
  }
}

// Usage
async function main() {
  const fetcher = new MemecoinFetcher();

  console.log("Starting data fetch for last 24 hours...");
  try {
    await fetcher.fetchLast24Hours();
    console.log("\nData fetch completed successfully");
  } catch (error) {
    console.error("Error in main execution:", error.message);
    process.exit(1);
  }
}

main();
