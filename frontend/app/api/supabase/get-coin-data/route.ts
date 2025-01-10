import { toZonedTime } from "date-fns-tz";
import { Price, TokenData } from "../../../../lib/types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

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
        count,
        mention_at
      ),
      tweets(id, created_at, tweet, tweet_id)
    `
      )
      .eq("id", parseInt(tokenId))
      .order("trade_at", { foreignTable: "prices", ascending: true })
      .order("mention_at", { foreignTable: "mentions", ascending: true })
      .order("created_at", { foreignTable: "tweets", ascending: false })
      .single();

    if (error) {
      console.error("Error fetching token details:", error);
      return NextResponse.json(
        { error: "Failed to fetch token data" },
        { status: 500 }
      );
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const tokenData: TokenData = {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      uri: data.uri,
      image: "" as any,
      created_at: toZonedTime(
        new Date(data.created_at),
        timeZone
      ).toISOString(),
      address: data.address,
      prices: data.prices,
      latest_price_usd:
        data.prices.length == 0
          ? null
          : data.prices?.[data.prices.length - 1]?.price_usd,
      latest_price_sol:
        data.prices.length == 0
          ? null
          : data.prices?.[data.prices.length - 1]?.price_sol,
      latest_market_cap:
        data.prices.length == 0
          ? null
          : data.prices?.[data.prices.length - 1]?.price_usd * 1000000000,
      tweets: data.tweets,
      mentions: data.mentions.length,
      tiktoks: data.mentions,
      views: data.views,
    };

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
