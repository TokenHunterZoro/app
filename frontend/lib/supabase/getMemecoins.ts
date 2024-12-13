import { ITEMS_PER_PAGE, supabase } from "../constants";
import { TokenData } from "../types";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default async function getMemecoins(
  start: number
): Promise<TokenData[]> {
  // First, fetch tokens and join with the prices table to get the most recent price data
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error } = await supabase
    .from("tokens")
    .select(
      `
      id,
      name,
      symbol,
      uri,
      created_at,
      address,
      views,
      mentions,
      prices!inner(price_usd, price_sol, is_latest)
    `
    )
    .eq("prices.is_latest", true)
    .order("mentions", { ascending: false }) // Order by ID
    .limit(ITEMS_PER_PAGE)
    .gt("id", start); // Fetch rows with IDs greater than the last fetched ID

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  // Map data to the desired format, including IPFS image URI and price data
  const memecoins = await Promise.all(
    data.map(async (token) => {
      //   const fetchMetadataResponse = await fetch(token.uri);
      //   const metadata = await fetchMetadataResponse.json();

      const prices = token.prices.filter((price) => price.is_latest);
      let latestPrice = prices[0] || {
        price_sol: (token.id % 8) / 12345,
        price_usd: (token.id % 3) / 12345,
      };

      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        uri: token.uri,
        image: "" as any,
        created_at: toZonedTime(
          new Date(token.created_at),
          timeZone
        ).toISOString(),
        address: token.address,
        prices: [],
        latest_price_usd: latestPrice.price_usd || 0,
        latest_market_cap: (latestPrice.price_usd || 0) * 1000000000,
        latest_price_sol: latestPrice.price_sol || 0,
        views: token.views,
        mentions: token.mentions,
        tweets: [],
        tiktoks: [],
      };
    })
  );

  await Promise.all(
    (
      await Promise.all(
        memecoins.map(async (memecoin) => {
          const response = await fetch(memecoin.uri);
          return await response.json();
        })
      )
    ).map(async (metadata, i) => {
      const imageResponse = await fetch(metadata.image);
      const image = await imageResponse.blob();
      memecoins[i].image = URL.createObjectURL(image);
    })
  );

  console.log(memecoins);

  return memecoins;
}
