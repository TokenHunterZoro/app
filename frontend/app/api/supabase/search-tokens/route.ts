import { IPFS_GATEWAY_URL, ITEMS_PER_PAGE } from "@/lib/constants";
import { SearchTokenResponse } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 15); // Generate a unique request ID for tracking
  console.log(`[${requestId}] Received request: ${request.url}`);

  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");
    console.log(`[${requestId}] Search Term: ${searchTerm}`);

    if (!searchTerm) {
      console.warn(`[${requestId}] No search term provided.`);
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    console.log(`[${requestId}] Fetching tokens from Supabase...`);
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
      console.error(`[${requestId}] Error fetching data from Supabase:`, error);
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Tokens fetched:`, data);

    const memecoins = data.map((token) => {
      return {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        uri: token.uri,
        image: "",
      };
    });

    console.log(`[${requestId}] Successfully processed memecoins:`, memecoins);
    return NextResponse.json(memecoins);
  } catch (error) {
    console.error(`[${requestId}] Error processing request:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
