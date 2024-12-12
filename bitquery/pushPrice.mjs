import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";

dotenv.config();

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

async function getTokenIdForUri(uri) {
  const { data, error } = await supabase
    .from("tokens")
    .select("id")
    .eq("uri", uri)
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data?.id;
}

async function updatePriceForToken(tokenId, priceData) {
  // First, set all existing prices for this token to not latest
  const { error: updateError } = await supabase
    .from("prices")
    .update({ is_latest: false })
    .eq("token_id", tokenId)
    .eq("is_latest", true);

  if (updateError) {
    console.error(
      `Error updating old prices for token ${tokenId}:`,
      updateError
    );
    return false;
  }

  // Insert new price
  const { error: insertError } = await supabase.from("prices").insert({
    token_id: tokenId,
    price_sol: priceData.price_sol,
    price_usd: priceData.price_usd,
    trade_at: priceData.created_at,
    is_latest: true,
  });

  if (insertError) {
    console.error(
      `Error inserting new price for token ${tokenId}:`,
      insertError
    );
    return false;
  }

  return true;
}

async function pushPrices(filePath) {
  try {
    // Read JSON file
    const jsonData = await fs.readFile(filePath, "utf8");
    const tokens = JSON.parse(jsonData);

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

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

    // Process in batches
    for (let i = 0; i < priceDataArray.length; i += batchSize) {
      const batch = priceDataArray.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          priceDataArray.length / batchSize
        )}`
      );

      // Process each record in the batch
      await Promise.all(
        batch.map(async (priceData) => {
          try {
            const tokenId = await getTokenIdForUri(priceData.uri);

            if (tokenId) {
              const success = await updatePriceForToken(tokenId, priceData);
              if (success) {
                processedCount++;
              } else {
                errorCount++;
              }
            } else {
              skippedCount++;
            }
          } catch (error) {
            console.error(`Error processing record:`, error);
            errorCount++;
          }
        })
      );

      // Log progress
      console.log(
        `Progress: Processed=${processedCount}, Skipped=${skippedCount}, Errors=${errorCount}`
      );
    }

    console.log("\nFinal Results:");
    console.log(`Successfully processed: ${processedCount}`);
    console.log(`Skipped (no matching token): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Error processing prices:", error);
    throw error;
  }
}

pushPrices("./results/prices.json")
  .catch(console.error)
  .finally(() => {
    console.log("Update prices completed");
  });
