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
      for (const videos of result.videos) {
        const tiktokId = getTiktokId(videos.video_url);
        const updateData = {
          id: tiktokId,
          username: videos.author,
          url: videos.video_url,
          thumbnail: videos.thumbnail_url,
          created_at: new Date(videos.posted_timestamp * 1000).toISOString(),
          fetched_at: fetchedAt,
          views: formatViews(videos.views.length > 0 ? videos.views : "0"),
          comments: videos.comments.count,
        };

        mentionsData.push({
          tiktok_id: tiktokId,
          views: updateData.views,
          data: videos.comments.tickers,
        });
        addTiktokData.push(updateData);
      }
    }

    const insertResponse = await supabase
      .from("tiktoks")
      .upsert(addTiktokData, {
        onConflict: "id",
      });
    if (insertResponse.error) {
      throw new Error(insertResponse.error.message);
    }

    for (const m of mentionsData) {
      try {
        const addMentionsData = [];
        for (const [symbol, mentions] of Object.entries(m.data)) {
          // Fetch the current record for the symbol (case-insensitive)
          const response = await supabase
            .from("tokens")
            .select("*")
            .ilike("symbol", symbol)
            .order("id", { ascending: true });

          if (response.error) {
            console.log("Error when fetching token data");
            throw new Error(response.error.message);
          }
          if (response.data.length === 0) {
            console.log("Coin not found. Skipping...");
            continue;
          }

          const currentData = response.data;

          if (currentData) {
            // If a record exists, add the mentions to the existing value
            for (const data of currentData)
              addMentionsData.push({
                tiktok_id: m.tiktok_id,
                count: mentions,
                token_id: data.id,
                mention_at: new Date().toISOString(),
              });
          }
        }
        const addMentionsResponse = await supabase
          .from("mentions")
          .insert(addMentionsData);

        if (addMentionsResponse.error) {
          throw new Error(addMentionsResponse.error.message);
        }
      } catch (error) {
        return {
          success: false,
          error: error.toString(),
          message: "Failed to update mentions data",
        };
      }
    }

    return {
      success: true,
      insertedRecords: insertResponse.data,
      message: `Successfully inserted ${insertResponse.data.length} records`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: "Failed to add tiktok data",
    };
  }
}

function formatViews(views) {
  let num = 0;
  if (views.endsWith("k") || views.endsWith("K")) {
    // Convert to thousands
    num = parseFloat(views.slice(0, -1)) * 1000;
  } else if (views.endsWith("m") || views.endsWith("M")) {
    // Convert to millions
    num = parseFloat(views.slice(0, -1)) * 1000000;
  } else {
    // Convert to plain number
    num = parseFloat(views);
  }
  return Math.floor(num);
}

function getTiktokId(url) {
  // Regex to extract the video ID
  const pattern = /\/video\/(\d+)/;
  const match = url.match(pattern);
  if (match) {
    return match[1];
  }
  return null;
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
const supabase = createClient(url, key);

const data = JSON.parse(
  fs.readFileSync("combined_results_2024-12-20T13-39-41-471Z.json", "utf8")
);

addTiktoks(supabase, data)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
