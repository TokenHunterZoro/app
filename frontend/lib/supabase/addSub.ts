import { createClient } from "@supabase/supabase-js";

export default async function addSub(
  address: string,
  amount: number,
  expires: number
) {
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
    console.error("Error fetching data:", error);
    return [];
  }

  return data;
}
