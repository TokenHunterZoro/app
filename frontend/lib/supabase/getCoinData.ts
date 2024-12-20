import { toZonedTime } from "date-fns-tz";
import { Price, TokenData } from "../types";
import { createClient } from "@supabase/supabase-js";

const getCoinData = async (tokenId: number): Promise<TokenData | null> => {
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_SECRET || ""
  );

  const { data, error } = await supabase
    .from("tokens")
    .select(
      `
    *,
    prices(
      price_usd,
      price_sol,
      trade_at
    ),
    mentions(
      tiktoks(username, thumbnail, url, created_at, views),
      count
    ),
    tweets(id, created_at, tweet, tweet_id)
  `
    )
    .eq("id", tokenId)
    .eq("prices.is_latest", true)
    .single();

  if (error) {
    console.error("Error fetching token details:", error);
    return null;
  }

  console.log(data);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    id: data.id,
    name: data.name,
    symbol: data.symbol,
    uri: data.uri,
    image: "" as any,
    created_at: toZonedTime(new Date(data.created_at), timeZone).toISOString(),
    address: data.address,
    prices: data.prices,
    latest_price_usd:
      data.prices.length == 0 ? null : data.prices?.[0]?.price_usd,
    latest_price_sol:
      data.prices.length == 0 ? null : data.prices?.[0]?.price_sol,
    latest_market_cap:
      data.prices.length == 0 ? null : data.prices?.[0]?.price_usd * 1000000000,
    tweets: data.tweets,
    mentions: data.mentions.length,
    tiktoks: data.mentions,
    views: data.views,
  };
};

export default getCoinData;
