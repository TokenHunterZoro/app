import { createClient } from "@supabase/supabase-js";

export default async function getSub(address: string) {
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
    return null;
  }

  return data.expires;
}
