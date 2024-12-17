import { IPFS_GATEWAY_URL, ITEMS_PER_PAGE, supabase } from "../constants";
import { SearchTokenResponse } from "../types";

export default async function searchTokens(
  searchTerm: string
): Promise<SearchTokenResponse[]> {
  // First, fetch tokens and join with the prices table to get the most recent price data
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error } = await supabase
    .from("tokens")
    .select(
      `
      id,
      name,
      symbol,
      uri
    `
    )
    .or(`symbol.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    .limit(ITEMS_PER_PAGE);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  const memecoins = data.map((token) => {
    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      uri: token.uri,
      image: "" as any,
    };
  });

  await Promise.all(
    (
      await Promise.all(
        memecoins.map(async (memecoin) => {
          const response = await fetch(
            IPFS_GATEWAY_URL + memecoin.uri.split("/").at(-1)
          );
          return await response.json();
        })
      )
    ).map(async (metadata, i) => {
      const imageResponse = await fetch(
        IPFS_GATEWAY_URL + metadata.image.split("/").at(-1)
      );
      const image = await imageResponse.blob();
      memecoins[i].image = URL.createObjectURL(image);
    })
  );

  console.log(memecoins);

  return memecoins;
}
