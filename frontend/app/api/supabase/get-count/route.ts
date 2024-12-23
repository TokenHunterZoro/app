import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    const { count, error } = await supabase.from("tokens").select("*", {
      count: "exact",
      head: true, // This makes it only fetch the count, not the actual records
    });

    if (error) {
      console.error("Error fetching count:", error);
      return NextResponse.json(
        { error: "Failed to fetch count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
