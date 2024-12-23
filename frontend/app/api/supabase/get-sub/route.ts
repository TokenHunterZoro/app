import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    const { data, error } = await supabase
      .from("subs")
      .select("expires")
      .eq("address", address)
      .single();

    if (error) {
      console.error("Error fetching data:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ expires: data.expires });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
