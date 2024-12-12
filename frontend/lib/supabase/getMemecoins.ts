import { ITEMS_PER_PAGE, supabase } from "../constants";

export default async function getMemecoins(start: number) {
  // First, fetch tokens and join with the prices table to get the most recent price data
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
      prices:prices(price_usd, price_sol, market_cap)
    `
    )
    .eq("prices.is_latest", true)
    .order("id", { ascending: true }) // Order by ID
    .limit(ITEMS_PER_PAGE)
    .gt("id", start); // Fetch rows with IDs greater than the last fetched ID

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }
  console.log(data);

  // Map data to the desired format, including IPFS image URI and price data
  const memecoins = await Promise.all(
    data.map(async (token) => {
      //   const fetchMetadataResponse = await fetch(token.uri);
      //   const metadata = await fetchMetadataResponse.json();

      const latestPrice =
        token.prices.length > 0
          ? token.prices[0]
          : {
              price_usd: 0,
              price_sol: 0,
              market_cap: 0,
            }; // Ensure we have the latest price
      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        uri: token.uri,
        image: "" as any,
        created_at: token.created_at,
        address: token.address,
        price_usd: latestPrice.price_usd || null,
        price_sol: latestPrice.price_sol || null,
        market_cap: latestPrice.market_cap || null,
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

  return memecoins;
}
