import { IPFS_GATEWAY_URL, ITEMS_PER_PAGE } from "@/lib/constants";
import { toZonedTime } from "date-fns-tz";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = parseInt(searchParams.get("start") || "0");

    // First, fetch tokens and join with the prices table to get the most recent price data
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );
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
      .order("mentions", { ascending: false })
      .range(start, start + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    // Map data to the desired format, including IPFS image URI and price data
    const memecoins = await Promise.all(
      data.map(async (token) => {
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
        const buffer = await imageResponse.arrayBuffer();
        const base64Image = `data:image/png;base64,${Buffer.from(
          buffer
        ).toString("base64")}`;
        memecoins[i].image = base64Image;
      })
    );

    return NextResponse.json(memecoins);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
