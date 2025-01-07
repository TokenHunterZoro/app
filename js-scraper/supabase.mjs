import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export async function addTiktoks(supabase, tiktoks) {
  try {
    const fetchedAt = tiktoks.extraction_time;
    const addTiktokData = [];
    const mentionsData = [];

    for (const result of tiktoks.results) {
      for (const video of result.videos) {
        const tiktokId = getTiktokId(video.video_url);
        const updateData = {
          id: tiktokId,
          username: video.author,
          url: video.video_url,
          thumbnail: video.thumbnail_url,
          created_at: new Date(video.posted_timestamp * 1000).toISOString(),
          fetched_at: fetchedAt,
          views: formatViews(video.views?.toString() || "0"),
          comments: video.comments?.count || 0,
        };

        mentionsData.push({
          tiktok_id: tiktokId,
          views: updateData.views,
          data: video.comments?.tickers || {},
        });
        addTiktokData.push(updateData);
      }
    }

    const insertResponse = await supabase
      .from("tiktoks")
      .upsert(addTiktokData, { onConflict: "id" })
      .select();
    if (insertResponse.error) {
      throw new Error(insertResponse.error.message);
    }

    // Fetch all tokens once
    const response = await supabase
      .from("tokens")
      .select("id,symbol")
      .order("id", { ascending: true });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Create a map of symbol to token IDs
    const symbolToTokens = new Map();
    response.data.forEach((token) => {
      if (!symbolToTokens.has(token.symbol)) {
        symbolToTokens.set(token.symbol, []);
      }
      symbolToTokens.get(token.symbol).push(token.id);
    });
    const mentionAt = new Date().toISOString();
    await Promise.all(
      mentionsData.map(async (mention) => {
        const addMentionsData = [];

        for (const [symbol, mentions] of Object.entries(mention.data)) {
          // Check if symbol exists in our map
          const tokenIds = symbolToTokens.get(symbol);
          if (!tokenIds) {
            // console.warn(`Token not found for symbol: ${symbol}. Skipping.`);
            continue;
          }

          // Add mention entry for each token ID associated with the symbol
          for (const tokenId of tokenIds) {
            addMentionsData.push({
              tiktok_id: mention.tiktok_id,
              count: mentions,
              token_id: tokenId,
              mention_at: mentionAt,
            });
          }
        }

        if (addMentionsData.length > 0) {
          console.log("ADD MENTIONS STARTING");
          const addMentionsResponse = await supabase
            .from("mentions")
            .insert(addMentionsData);
          console.log("ADD MENTIONS ENDING");

          if (addMentionsResponse.error) {
            throw new Error(addMentionsResponse.error.message);
          }
        }
      })
    );

    return {
      success: true,
      message: `Successfully inserted ${insertResponse.data.length} TikTok records`,
    };
  } catch (error) {
    console.error("Error adding TikTok data:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Failed to add TikTok data",
    };
  }
}

function formatViews(views) {
  const unitMultiplier = {
    k: 1_000,
    m: 1_000_000,
  };

  const unit = views.slice(-1).toLowerCase();
  if (unit in unitMultiplier) {
    return Math.floor(parseFloat(views.slice(0, -1)) * unitMultiplier[unit]);
  }
  return Math.floor(parseFloat(views)) || 0;
}

function getTiktokId(url) {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

// (async () => {
//   const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_KEY
//   );
//   const data = JSON.parse(
//     fs.readFileSync("combined_results_2024-12-27T07-22-03-044Z.json", "utf8")
//   );

//   try {
//     const response = await addTiktoks(supabase, data);
//     console.log(response);
//   } catch (error) {
//     console.error("Unexpected error:", error);
//   }
// })();
