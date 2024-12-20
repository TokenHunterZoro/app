import { IPFS_GATEWAY_URL, ITEMS_PER_PAGE } from "@/lib/constants";
import { SearchTokenResponse } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm");

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
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
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
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

    return NextResponse.json(memecoins);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
