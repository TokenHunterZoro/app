import { ITEMS_PER_PAGE } from "@/lib/constants";
import { toZonedTime } from "date-fns-tz";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let start = parseInt(searchParams.get("start") || "0");

    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    const uniqueSymbols = new Set();
    const results = [];
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    while (uniqueSymbols.size < 7) {
      const { data, error } = await supabase
        .from("tokens")
        .select(
          `
          id,
          name,
          symbol,
          uri,
          views,
          created_at,
          mentions,
          prices!inner(price_usd, price_sol, is_latest)
        `
        )
        .eq("prices.is_latest", true)
        .neq("mentions", 0)
        .order("created_at", { ascending: false })
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) {
        return NextResponse.json(
          { error: "Database query failed", details: error.message },
          { status: 500 }
        );
      }
      if (!data || data.length === 0) {
        return NextResponse.json([]);
      }
      for (const entry of data) {
        results.push(entry);
        uniqueSymbols.add(entry.symbol.toUpperCase());
        if (uniqueSymbols.size === 7) {
          break;
        }
      }

      // Increment range for pagination
      start += ITEMS_PER_PAGE;
    }

    const memecoins = results.map((token) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      uri: token.uri,
      image: null,
      created_at: toZonedTime(
        new Date(token.created_at),
        timeZone
      ).toISOString(),
      latest_price_usd: token.prices?.[0]?.price_usd || 0,
      latest_market_cap: (token.prices?.[0]?.price_usd || 0) * 1000000000,
      latest_price_sol: token.prices?.[0]?.price_sol || 0,
      views: token.views,
      mentions: token.mentions,
    }));

    return NextResponse.json(memecoins);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
