import { supabase } from "../constants";
import { Price, TokenData } from "../types";

const getCoinData = async (tokenId: number): Promise<TokenData | null> => {
  const { data, error } = await supabase
    .from("tokens")
    .select(
      `
        *,
        prices(
          price_usd,
          price_sol,
          trade_at,
          is_latest
        ),
        mentions(
          tiktoks(username, thumbnail, url, created_at, views),
          count
        ),
        tweets(id, created_at, tweet, tweet_id)
      `
    )
    .eq("id", tokenId);

  if (error) {
    console.error("Error fetching token details:", error);
    return null;
  }

  console.log(data);

  // Optional: Sort prices by date if needed
  if (data && data[0].prices) {
    data[0].prices.sort(
      (a: Price, b: Price) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return {
    ...data[0],
    latest_price_usd:
      data[0].prices.length == 0
        ? (data[0].id % 3) / 12345
        : data[0].prices?.[0]?.price_usd,
    latest_price_sol:
      data[0].prices.length == 0
        ? (data[0].id % 8) / 12345
        : data[0].prices?.[0]?.price_sol,
    latest_market_cap:
      data[0].prices.length == 0
        ? ((data[0].id % 3) / 12345) * 1000000000
        : data[0].prices?.[0]?.price_usd * 1000000000,
    tweets: data[0].tweets,
    mentions: data[0].mentions.length,
    tiktoks: data[0].mentions,
  };
};

export default getCoinData;
