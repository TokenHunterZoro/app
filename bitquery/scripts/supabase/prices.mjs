import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";

dotenv.config();

export async function pushPrices(filePath, dataJson) {
  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_KEY in environment variables"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sanitize = (str) => (str ? str.replace(/\u0000/g, "") : str);
  try {
    // Read JSON file
    const tokens =
      filePath.length > 0
        ? JSON.parse(await fs.readFile(filePath, "utf8"))
        : dataJson;

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    const priceDataArray = [];

    for (const priceData of tokens.data.Solana.DEXTrades) {
      if (!priceData.Trade?.Buy?.Currency?.Uri) {
        console.warn("Skipping record with missing URI");
        continue;
      }

      priceDataArray.push({
        price_sol: priceData.Trade.Buy.Price,
        price_usd: priceData.Trade.Buy.PriceInUSD,
        created_at: sanitize(priceData.Block.Time),
        uri: priceData.Trade.Buy.Currency.Uri,
      });
    }

    console.log(
      `Processing ${priceDataArray.length} records in batches of ${batchSize}...`
    );

    // Process in batche

    for (let i = 0; i < priceDataArray.length; i += batchSize) {
      const batch = priceDataArray.slice(i, i + batchSize);
      const uris = batch.map((priceData) => priceData.uri);
      const { data: tokensData, error: tokensError } = await supabase
        .from("tokens")
        .select("id, uri")
        .in("uri", uris);

      if (tokensError) {
        console.error("Error fetching tokens:", tokensError);
        return;
      }

      const uriToTokenId = tokensData.reduce((map, token) => {
        map[token.uri] = token.id;
        return map;
      }, {});
      const updates = [];
      const missingUris = [];

      batch.forEach((item) => {
        const tokenId = uriToTokenId[item.uri];
        if (tokenId) {
          updates.push({
            token_id: tokenId,
            price_usd: item.price_usd,
            price_sol: item.price_sol,
            trade_at: item.created_at,
            is_latest: true,
          });
        } else {
          missingUris.push(item.uri);
        }
      });
      if (missingUris.length > 0) {
        console.warn(
          "The following URIs were not found in the tokens table:",
          missingUris
        );
      }
      const { data, error } = await supabase
        .from("prices")
        .insert(updates, { upsert: true });

      if (error) {
        console.error(`Error updating batch starting at index ${i}:`, error);
      } else {
        console.log(`Batch starting at index ${i} updated successfully:`, data);
      }
    }
  } catch (error) {
    console.error("Error processing prices:", error);
    throw error;
  }
}

// pushPrices("./results/prices-4.json")
//   .catch(console.error)
//   .finally(() => {
//     console.log("Update prices completed");
//   });
