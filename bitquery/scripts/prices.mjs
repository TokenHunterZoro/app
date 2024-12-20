import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs/promises";
import { pushPrices } from "./supabase/prices.mjs";

dotenv.config();

const path = "results/memecoins/metadata.json";

const getMetadata = async () => {
  try {
    return JSON.parse(await fs.readFile(path, "utf-8"));
  } catch (error) {
    console.error("Error reading metadata:", error);
  }
  // Return default metadata if file doesn't exist or is invalid
  return {
    sinceTimestamp: "2024-12-20T03:46:24Z",
    latestFetchTimestamp: null,
  };
};

async function updateMetadata(metadata) {
  await fs.writeFile(path, JSON.stringify(metadata, null, 2), "utf-8");
}

// axios
//   .request(config)
//   .then((response) => {
//     // Save the response data as a JSON file
//     fs.writeFileSync(
//       "results/prices-5.json",
//       JSON.stringify(response.data, null, 2),
//       "utf-8"
//     );
//     console.log("Data saved to response.json");
//     pushPrices("./results/prices-" + Date.now() + ".json");
//   })
//   .catch((error) => {
//     console.error("Error fetching data:", error);
//   });

export async function fetchAndPushPrices() {
  const metadata = await getMetadata();
  const latestFetchTimestamp = new Date(metadata.latestFetchTimestamp);
  latestFetchTimestamp.setSeconds(latestFetchTimestamp.getSeconds() + 1);

  const data = JSON.stringify({
    query: `{
    Solana {
      DEXTrades(
        limitBy: { by: Trade_Buy_Currency_MintAddress, count: 1 }
        orderBy: { descending: Block_Time }
        where: {
          Trade: {
            Dex: { ProtocolName: { is: "pump" } }
            Buy: {
              Currency: {
                MintAddress: { notIn: ["11111111111111111111111111111111"] }
              }
            }
          }
          Transaction: { Result: { Success: true } }
          Block: {Time: {since: "${latestFetchTimestamp.toISOString()}"}}
        }
      ) {
        Trade {
          Buy {
            Price
            PriceInUSD
            Currency {
              Uri
            }
          }
        }
        Block {
          Time
        }
      }
    }
  }
  `,
    variables: "{}",
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/eap",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BITQUERY_API_KEY,
      Authorization: "Bearer " + process.env.ACCESS_TOKEN,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    await fs.writeFile(
      "results/prices/prices-" + Date.now() + ".json",
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );
    metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
    metadata.latestFetchTimestamp =
      response.data.data.Solana.DEXTrades[0].Block.Time;
    console.log("NEW PRICES METADATA");
    console.log(metadata);
    console.log("PUSHING TO SUPABASE");
    console.log(response.data.data.Solana.DEXTrades.length);
    await updateMetadata(metadata);
    await pushPrices("", response.data);
  } catch (e) {
    console.error("Error fetching data:", e);
  }
}

// fetchAndPushPrices();
