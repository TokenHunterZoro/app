import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address, amount, expires } = await request.json();

    // Create a single supabase client for interacting with your database
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

    const { data, error } = await supabase.from("subs").insert([
      {
        created_at: new Date().toISOString(),
        address: address,
        amount: amount,
        expires: new Date(new Date().getTime() + expires * 1000).toISOString(),
      },
    ]);

    if (error) {
      console.error("Error inserting data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
