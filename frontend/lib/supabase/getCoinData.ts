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
        )
      `
    )
    .eq("id", tokenId)
    .single();

  if (error) {
    console.error("Error fetching token details:", error);
    return null;
  }

  // Optional: Sort prices by date if needed
  if (data && data.prices) {
    data.prices.sort(
      (a: Price, b: Price) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return {
    ...data,
    latest_price_usd: data?.prices?.[0]?.price_usd,
    latest_market_cap: data?.prices?.[0]?.price_usd * 1000000000,
  };
};

export default getCoinData;
